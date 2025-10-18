import { View, ScrollView, Text } from "@tarojs/components";
import React from "react";
import { useState, useEffect, useCallback } from "react";
import Taro from "@tarojs/taro";
import {
  InputNumber,
  Badge,
  Button,
  Toast,
  Avatar,
  TextArea,
} from "@nutui/nutui-react-taro";
import ProductImage from "../../../components/index";
import plusIcon from "../../../assets/icons/plus.png";
import shoppingCar from "../../../assets/icons/shoppingcar.png";
import { createOrder, getCurrentUser } from "../../../services/api";
import { WECHAT_CONFIG } from "../../../constants/api";
import { debounce } from "../../../utils/debounce";
import "./index.scss";

// 购物车角标显示配置
// true: 显示菜品种类数（有3种菜就显示3）
// false: 显示菜品总数量（番茄炒蛋×2 + 鸡翅×3 = 显示5）
const SHOW_ITEM_TYPES_IN_BADGE = true;

const CategoryMenu = ({ categories }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showInputNumbers, setShowInputNumbers] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [cartTotal, setCartTotal] = useState(0); // 菜品总数量（所有菜品的数量之和）
  const [cartItemCount, setCartItemCount] = useState(0); // 菜品种类数量（不同菜品的个数）
  const [selectedItems, setSelectedItems] = useState({}); // 存储选中的商品信息
  const [currentUser, setCurrentUser] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartShake, setCartShake] = useState(false);
  const [orderRemark, setOrderRemark] = useState(""); // 订单备注

  useEffect(() => {
    if (categories?.length > 0) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  useEffect(() => {
    // 获取当前用户信息
    getCurrentUser().then(setCurrentUser);
    // 从本地存储加载购物车
    loadCartFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行一次

  // 监听订单备注变化，自动保存到本地存储（使用防抖优化）
  useEffect(() => {
    if (Object.keys(selectedItems).length > 0) {
      const debouncedSave = debounce(() => {
        saveCartToStorage(
          selectedItems,
          inputValues,
          showInputNumbers,
          cartTotal,
          orderRemark
        );
      }, 500); // 500ms 防抖延迟

      debouncedSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderRemark]); // 只在orderRemark变化时执行

  // 从本地存储加载购物车
  const loadCartFromStorage = useCallback(() => {
    try {
      const savedCart = Taro.getStorageSync("shopping_cart");
      if (savedCart) {
        setSelectedItems(savedCart.selectedItems || {});
        setInputValues(savedCart.inputValues || {});
        setShowInputNumbers(savedCart.showInputNumbers || {});
        setCartTotal(savedCart.cartTotal || 0);
        setCartItemCount(Object.keys(savedCart.selectedItems || {}).length);
        setOrderRemark(savedCart.orderRemark || ""); // 恢复订单备注
      }
    } catch (error) {
      console.error("加载购物车失败:", error);
    }
  }, []);

  // 计算购物车总数量（所有菜品数量之和）
  const calculateCartTotal = useCallback((items) => {
    return Object.values(items).reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, []);

  // 购物车抖动动画
  const triggerCartShake = useCallback(() => {
    setCartShake(true);
    setTimeout(() => {
      setCartShake(false);
    }, 500);
  }, []);

  // 保存购物车到本地存储
  const saveCartToStorage = useCallback(
    (items, values, showNumbers, total, remark = "") => {
      try {
        Taro.setStorageSync("shopping_cart", {
          selectedItems: items,
          inputValues: values,
          showInputNumbers: showNumbers,
          cartTotal: total,
          orderRemark: remark, // 保存订单备注
        });
        // 更新菜品种类数量
        setCartItemCount(Object.keys(items).length);
        // 触发购物车抖动动画
        triggerCartShake();
      } catch (error) {
        console.error("保存购物车失败:", error);
      }
    },
    [triggerCartShake]
  );

  const handleCategoryClick = (id) => {
    setSelectedCategory(id);
    Taro.createSelectorQuery()
      .select(`#category-${id}`)
      .boundingClientRect((rect) => {
        if (rect) {
          Taro.pageScrollTo({
            selector: `#category-${id}`,
            duration: 300,
            offsetTop: 0,
          });
        }
      })
      .exec();
  };

  const toggleInputNumber = (dish) => {
    const { id: dishId, price } = dish;
    console.log(
      "toggleInputNumber - dishId:",
      dishId,
      "当前showInputNumbers:",
      showInputNumbers
    );

    // 如果这个菜品已经在购物车中，直接返回
    if (showInputNumbers[dishId]) {
      return;
    }

    // 添加新菜品到购物车
    const newShowInputNumbers = {
      ...showInputNumbers,
      [dishId]: true,
    };
    const newInputValues = {
      ...inputValues,
      [dishId]: 1,
    };
    const newCartTotal = cartTotal + 1;
    const newSelectedItems = {
      ...selectedItems,
      [dishId]: {
        ...dish,
        quantity: 1,
      },
    };

    console.log("toggleInputNumber - 新的selectedItems:", newSelectedItems);

    setShowInputNumbers(newShowInputNumbers);
    setInputValues(newInputValues);
    setCartTotal(newCartTotal);
    setSelectedItems(newSelectedItems);

    // 保存到本地存储
    saveCartToStorage(
      newSelectedItems,
      newInputValues,
      newShowInputNumbers,
      newCartTotal,
      orderRemark
    );
  };

  const handleValueChange = (value, dish) => {
    const { id: dishId } = dish;
    const oldValue = Number(inputValues[dishId]) || 0;
    const newValue = Number(value) || 1;
    const difference = newValue - oldValue;

    const newInputValues = {
      ...inputValues,
      [dishId]: newValue,
    };
    const newCartTotal = cartTotal + difference;
    const newSelectedItems = {
      ...selectedItems,
      [dishId]: {
        ...selectedItems[dishId],
        quantity: newValue,
      },
    };

    setInputValues(newInputValues);
    setCartTotal(newCartTotal);
    setSelectedItems(newSelectedItems);

    // 保存到本地存储
    saveCartToStorage(
      newSelectedItems,
      newInputValues,
      showInputNumbers,
      newCartTotal,
      orderRemark
    );
  };

  const handleMinusClick = (dishId) => {
    const currentValue = Number(inputValues[dishId]) || 1;
    if (currentValue <= 1) {
      // 移除菜品
      const newShowInputNumbers = { ...showInputNumbers };
      delete newShowInputNumbers[dishId];
      const newInputValues = { ...inputValues };
      delete newInputValues[dishId];
      const newSelectedItems = { ...selectedItems };
      delete newSelectedItems[dishId];

      // 使用统一的计算函数
      const newCartTotal = calculateCartTotal(newSelectedItems);

      setShowInputNumbers(newShowInputNumbers);
      setInputValues(newInputValues);
      setCartTotal(newCartTotal);
      setSelectedItems(newSelectedItems);
      setCartItemCount(Object.keys(newSelectedItems).length);

      // 保存到本地存储
      saveCartToStorage(
        newSelectedItems,
        newInputValues,
        newShowInputNumbers,
        newCartTotal,
        orderRemark
      );
    } else {
      // 减少数量
      const newValue = currentValue - 1;
      const newInputValues = { ...inputValues, [dishId]: newValue };
      const newSelectedItems = { ...selectedItems };
      newSelectedItems[dishId].quantity = newValue;

      // 使用统一的计算函数
      const newCartTotal = calculateCartTotal(newSelectedItems);

      setInputValues(newInputValues);
      setSelectedItems(newSelectedItems);
      setCartTotal(newCartTotal);

      // 保存到本地存储
      saveCartToStorage(
        newSelectedItems,
        newInputValues,
        showInputNumbers,
        newCartTotal,
        orderRemark
      );
    }
  };

  // 计算总积分
  const calculateTotalPoints = useCallback(() => {
    return Object.values(selectedItems).reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  }, [selectedItems]);

  // 提交订单
  const handleSubmitOrder = async () => {
    if (Object.keys(selectedItems).length === 0) {
      Toast.show({
        type: "fail",
        content: "购物车是空的哦~",
        duration: 2000,
      });
      return;
    }

    const totalPoints = calculateTotalPoints();

    // 检查积分是否足够
    if (currentUser && currentUser.points < totalPoints) {
      const neededPoints = totalPoints - currentUser.points;
      Toast.show({
        type: "fail",
        content: `积分不足哦！还需要 ${neededPoints} 积分`,
        duration: 3000,
      });

      // 显示积分不足引导弹窗
      setTimeout(() => {
        Taro.showModal({
          title: "积分不足",
          content: `您还需要 ${neededPoints} 积分才能下单。\n\n获取积分的方法：\n• 完成订单可获得10%积分奖励\n• 联系大厨获得积分奖励\n• 等待系统活动`,
          confirmText: "积分中心",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              Taro.navigateTo({
                url: "/subpackages/user/points/index",
              });
            }
          },
        });
      }, 1000);

      return;
    }

    try {
      // 🔔 请求订阅消息授权
      // 在创建订单前，请求用户授权接收订阅消息
      try {
        await Taro.requestSubscribeMessage({
          tmplIds: WECHAT_CONFIG.SUBSCRIBE_MESSAGE_TEMPLATE_IDS,
        });
        console.log("✅ 用户已授权订阅消息");
      } catch (subscribeError) {
        // 即使用户拒绝订阅，依然继续下单流程
        console.warn("用户拒绝订阅消息或订阅失败:", subscribeError);
      }

      // 准备订单数据
      const cartItems = Object.values(selectedItems).map((item) => ({
        dishId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      // 创建订单（后端会自动发送推送通知）
      const order = await createOrder(cartItems, totalPoints, orderRemark);

      console.log("✅ 订单创建成功:", order);
      console.log("📱 推送通知将由后端自动发送");

      // 清空购物车
      clearCart();

      // 跳转到订单页面
      setTimeout(() => {
        Taro.switchTab({
          url: "/pages/order/index",
        });
      }, 2000);
    } catch (error) {
      console.error("下单失败:", error);
      Toast.show({
        type: "fail",
        content: "下单失败，请重试",
        duration: 2000,
      });
    }
  };

  // 清空购物车
  const clearCart = () => {
    setSelectedItems({});
    setInputValues({});
    setShowInputNumbers({});
    setCartTotal(0);
    setCartItemCount(0);
    setShowCartModal(false);
    setOrderRemark(""); // 清空订单备注

    // 清空本地存储
    try {
      Taro.removeStorageSync("shopping_cart");
    } catch (error) {
      console.error("清空购物车存储失败:", error);
    }

    // 显示清空成功提示
    Toast.show({
      type: "success",
      content: "购物车已清空",
      duration: 1500,
    });
  };

  // 显示购物车详情
  const showCartDetails = () => {
    if (Object.keys(selectedItems).length === 0) {
      Toast.show({
        type: "text",
        content: "购物车是空的哦~",
        duration: 2000,
      });
      return;
    }
    setShowCartModal(true);
  };

  // 如果没有分类数据，显示空状态
  if (!categories || categories.length === 0) {
    return (
      <View className="menu-box empty-state">
        <View className="empty-container">
          <Text className="empty-text">暂无菜品数据</Text>
          <Text className="empty-hint">请稍后再试</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="menu-box">
      <View className="category-menu">
        <ScrollView scrollY className="category-scroll">
          {categories.map((item) => (
            <View
              key={item.id}
              className={`menu-item ${
                selectedCategory === item.id ? "active" : ""
              }`}
              onClick={() => handleCategoryClick(item.id)}
            >
              {item.name}
            </View>
          ))}

          {/* 管理分类选项 */}
          <View
            className="menu-item manage-category-item"
            onClick={() =>
              Taro.navigateTo({
                url: "/subpackages/admin/category-management/index",
              })
            }
          >
            📂 管理分类
          </View>
        </ScrollView>
      </View>

      <ScrollView
        scrollY
        enhanced
        className="product-list"
        scrollWithAnimation
        scrollIntoView={`category-${selectedCategory}`}
      >
        {categories.map((category) => (
          <View
            key={category.id}
            id={`category-${category.id}`}
            className="category-content"
          >
            <View className="category-title">{category.name}</View>
            {category.dishes?.map((dish) => (
              <View key={dish.id} className="all-food">
                <View className="product-Picture">
                  <ProductImage src={dish.image} mode="aspectFit" />
                </View>
                <View className="food-info">
                  <View className="food-name">{dish.name}</View>
                  <View className="food-describe">
                    {dish.description || "暂无描述"}
                  </View>
                  <View className="food-sales">销量: {dish.sales}</View>
                  <View className="food-price">{dish.price} 积分</View>

                  {showInputNumbers[dish.id] ? (
                    <View className="food-inputNumber">
                      <InputNumber
                        min={1}
                        value={inputValues[dish.id] || 1}
                        onChange={(value) => handleValueChange(value, dish)}
                        onMinus={() => handleMinusClick(dish.id)}
                      />
                    </View>
                  ) : (
                    <View
                      className="food-input"
                      onClick={() => toggleInputNumber(dish)}
                    >
                      <image src={plusIcon} />
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <View className="product-order">
        <Badge
          value={SHOW_ITEM_TYPES_IN_BADGE ? cartItemCount : cartTotal}
          style={{
            marginInlineEnd: "10px",
            "--nutui-badge-height": "12px",
            "--nutui-badge-padding": "0 3px",
            "--nutui-badge-font-size": "10px",
            "--nutui-badge-min-width": "3px",
          }}
        >
          <image
            src={shoppingCar}
            mode="aspectFit"
            onClick={showCartDetails}
            className={cartShake ? "cart-shake" : ""}
          />
        </Badge>
        <View className="product-dine" onClick={handleSubmitOrder}>
          下单 ({calculateTotalPoints() || 0} 积分)
        </View>
      </View>

      {/* 购物车详情弹窗 */}
      {showCartModal && (
        <View
          className="cart-modal-overlay"
          onClick={() => setShowCartModal(false)}
        >
          <View className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <View className="cart-header">
              <Text className="cart-title">购物车</Text>
              <View className="cart-header-actions">
                <Text className="cart-clear" onClick={clearCart}>
                  清空
                </Text>
                <Text
                  className="cart-close"
                  onClick={() => setShowCartModal(false)}
                >
                  ×
                </Text>
              </View>
            </View>
            <ScrollView scrollY className="cart-content">
              {Object.keys(selectedItems).length === 0 ? (
                <View className="cart-empty">
                  <Text className="cart-empty-text">购物车是空的哦~</Text>
                  <Text className="cart-empty-hint">
                    去添加一些美味的菜品吧！
                  </Text>
                </View>
              ) : (
                Object.values(selectedItems).map((item) => (
                  <View key={item.id} className="cart-item">
                    <View className="cart-item-info">
                      <View className="cart-item-header">
                        <Text className="cart-item-name">{item.name}</Text>
                        {item.addedBy && (
                          <View className="added-by-info">
                            <Avatar src={item.addedByAvatar} size="mini" />
                            <Text className="added-by-name">
                              {item.addedBy}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="cart-item-price">
                        {item.price} 积分 × {item.quantity}
                      </Text>
                    </View>
                    <View className="cart-item-actions">
                      <InputNumber
                        value={item.quantity || 1}
                        min={1}
                        onChange={(value) => handleValueChange(value, item)}
                        onMinus={() => handleMinusClick(item.id)}
                        onPlus={() =>
                          handleValueChange((item.quantity || 1) + 1, item)
                        }
                      />
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* 订单备注输入框 */}
            {Object.keys(selectedItems).length > 0 && (
              <View className="order-remark-section">
                <Text className="remark-label">订单备注：</Text>
                <TextArea
                  placeholder="有什么特殊要求吗？比如少盐、多辣、不要葱等..."
                  value={orderRemark}
                  onChange={(value) => setOrderRemark(value)}
                  maxLength={100}
                  limitShow
                  className="remark-textarea"
                />
              </View>
            )}

            <View className="cart-footer">
              <View className="cart-total">
                <Text className="total-text">
                  总计: {calculateTotalPoints() || 0} 积分
                </Text>
                {currentUser && (
                  <Text className="user-points">
                    我的积分: {currentUser.points}
                  </Text>
                )}
              </View>
              <View
                style={{
                  backgroundColor: "#f9dde6 !important",
                  width: "100%",
                  height: "80rpx",
                  textAlign: "center",
                  lineHeight: "80rpx",
                  borderRadius: "50rpx",
                  fontSize: "32rpx",
                  fontWeight: "600",
                  color: "#4a4a4a !important",
                  boxShadow: "0 4rpx 12rpx rgba(249, 221, 230, 0.3)",
                }}
                onClick={handleSubmitOrder}
                disabled={Object.keys(selectedItems).length === 0}
              >
                {Object.keys(selectedItems).length === 0
                  ? "购物车为空"
                  : "选好了，下单！"}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CategoryMenu;
