import { View, ScrollView, Text } from "@tarojs/components";
import React, { useState, useEffect, useCallback } from "react";
import Taro from "@tarojs/taro";
import { InputNumber, Badge, Button, Toast } from "@nutui/nutui-react-taro";
import ProductImage from "../../../components/index";
import plusIcon from "../../../assets/icons/plus.png";
import shoppingCar from "../../../assets/icons/shoppingcar.png";
import { createOrder, getCurrentUser } from "../../../services/api";
import "./index.scss";

const CategoryMenu = ({ categories }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showInputNumbers, setShowInputNumbers] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [cartTotal, setCartTotal] = useState(0); // 总数量
  const [cartItemCount, setCartItemCount] = useState(0); // 菜品种类数量
  const [selectedItems, setSelectedItems] = useState({}); // 存储选中的商品信息
  const [currentUser, setCurrentUser] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);

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
  }, []);

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
      }
    } catch (error) {
      console.error("加载购物车失败:", error);
    }
  }, []);

  // 保存购物车到本地存储
  const saveCartToStorage = useCallback((items, values, showNumbers, total) => {
    try {
      Taro.setStorageSync("shopping_cart", {
        selectedItems: items,
        inputValues: values,
        showInputNumbers: showNumbers,
        cartTotal: total,
      });
      // 更新菜品种类数量
      setCartItemCount(Object.keys(items).length);
    } catch (error) {
      console.error("保存购物车失败:", error);
    }
  }, []);

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
    const { _id: dishId, price } = dish;
    const newShowInputNumbers = {
      ...showInputNumbers,
      [dishId]: !showInputNumbers[dishId],
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

    setShowInputNumbers(newShowInputNumbers);
    setInputValues(newInputValues);
    setCartTotal(newCartTotal);
    setSelectedItems(newSelectedItems);

    // 保存到本地存储
    saveCartToStorage(
      newSelectedItems,
      newInputValues,
      newShowInputNumbers,
      newCartTotal
    );
  };

  const handleValueChange = (value, dish) => {
    const { _id: dishId } = dish;
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
      newCartTotal
    );
  };

  const handleMinusClick = (dishId) => {
    const currentValue = Number(inputValues[dishId]) || 1;
    if (currentValue === 1) {
      const newShowInputNumbers = { ...showInputNumbers };
      delete newShowInputNumbers[dishId];
      const newInputValues = { ...inputValues };
      delete newInputValues[dishId];
      const newCartTotal = cartTotal - 1;
      const newSelectedItems = { ...selectedItems };
      delete newSelectedItems[dishId];

      setShowInputNumbers(newShowInputNumbers);
      setInputValues(newInputValues);
      setCartTotal(newCartTotal);
      setSelectedItems(newSelectedItems);

      // 保存到本地存储
      saveCartToStorage(
        newSelectedItems,
        newInputValues,
        newShowInputNumbers,
        newCartTotal
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
      Toast.show({
        type: "fail",
        content: `积分不足哦！还需要 ${totalPoints - currentUser.points} 积分`,
        duration: 3000,
      });
      return;
    }

    try {
      // 准备订单数据
      const cartItems = Object.values(selectedItems).map((item) => ({
        dishId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      // 创建订单
      const order = await createOrder(cartItems, totalPoints);

      // 清空购物车
      clearCart();

      Toast.show({
        type: "success",
        content: "下单成功！大厨马上开始准备~",
        duration: 2000,
      });

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
    setShowCartModal(false);

    // 清空本地存储
    try {
      Taro.removeStorageSync("shopping_cart");
    } catch (error) {
      console.error("清空购物车存储失败:", error);
    }
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
              <View key={dish._id} className="all-food">
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

                  {showInputNumbers[dish._id] ? (
                    <View className="food-inputNumber">
                      <InputNumber
                        min={1}
                        value={inputValues[dish._id] || 1}
                        onChange={(value) => handleValueChange(value, dish)}
                        onMinus={() => handleMinusClick(dish._id)}
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
          value={cartItemCount}
          style={{
            marginInlineEnd: "10px",
            "--nutui-badge-height": "12px",
            "--nutui-badge-padding": "0 3px",
            "--nutui-badge-font-size": "10px",
            "--nutui-badge-min-width": "3px",
          }}
        >
          <image src={shoppingCar} mode="aspectFit" onClick={showCartDetails} />
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
              <Text
                className="cart-close"
                onClick={() => setShowCartModal(false)}
              >
                ×
              </Text>
            </View>
            <ScrollView scrollY className="cart-content">
              {Object.values(selectedItems).map((item) => (
                <View key={item._id} className="cart-item">
                  <View className="cart-item-info">
                    <Text className="cart-item-name">{item.name}</Text>
                    <Text className="cart-item-price">
                      {item.price} 积分 × {item.quantity}
                    </Text>
                  </View>
                  <View className="cart-item-actions">
                    <InputNumber
                      value={item.quantity || 1}
                      min={1}
                      onChange={(value) => handleValueChange(value, item)}
                      onMinus={() => handleMinusClick(item._id)}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
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
              <Button
                type="primary"
                size="large"
                onClick={handleSubmitOrder}
                disabled={Object.keys(selectedItems).length === 0}
              >
                确认下单
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CategoryMenu;
