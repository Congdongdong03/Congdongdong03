// 导入必要的组件和依赖
import { View } from "@tarojs/components";
import React, { useState } from "react";
import "./index.scss";
import { InputNumber } from "@nutui/nutui-react-taro";
import plusIcon from "../../../assets/icons/plus.png";
import shoppingCar from "../../../assets/icons/shoppingcar.png";
import { Badge } from "@nutui/nutui-react-taro";
// 仅添加 ProductImage 导入
import ProductImage from "../../../components/index";

const ProductList = ({ categories }) => {
  // 控制输入框显示/隐藏的状态对象, key为dishId
  const [showInputNumbers, setShowInputNumbers] = useState({});
  // 存储每个菜品的数量值, key为dishId
  const [inputValues, setInputValues] = useState({});

  // 处理加购按钮的点击事件
  const toggleInputNumber = (dishId) => {
    // 切换显示/隐藏状态
    setShowInputNumbers((prevState) => ({
      ...prevState, // 保持其他菜品状态不变
      [dishId]: !prevState[dishId], // 切换当前菜品的显示状态
    }));
    // 初始化或重置当前菜品的数量为1
    setInputValues((prevState) => ({
      ...prevState, // 保持其他菜品数量不变
      [dishId]: 1, // 设置当前菜品数量为1
    }));
  };

  // 处理数量变化的事件
  const handleValueChange = (value, dishId) => {
    // 更新菜品数量
    setInputValues((prevState) => ({
      ...prevState, // 保持其他菜品数量不变
      [dishId]: value, // 更新当前菜品的数量
    }));
  };

  // 处理减号按钮点击事件
  const handleMinusClick = (dishId) => {
    // 获取当前菜品的数量
    const currentValue = inputValues[dishId];
    // 当数量为1时点击减号
    if (currentValue === 1) {
      // 隐藏输入框，显示加购按钮（会显示红色）
      setShowInputNumbers((prevState) => ({
        ...prevState, // 保持其他菜品状态不变
        [dishId]: false, // 隐藏当前菜品的输入框
      }));
    }
  };

  return (
    <View className="product-list">
      {/* 遍历分类 */}
      {categories.map((category) => (
        <View key={category.id}>
          {/* 分类标题 */}
          <View className="category-title">{category.name}</View>
          {/* 遍历分类下的菜品 */}
          {category.dishes.map((dish) => (
            <View key={dish.id} className="all-food">
              {/* 菜品图片：使用 ProductImage 处理 API 图片 */}
              <View className="product-Picture">
                <ProductImage src={dish.avatar} mode="aspectFit" />
              </View>
              {/* 菜品信息容器 */}
              <View className="food-info">
                {/* 菜品名称 */}
                <View className="food-name">{dish.name}</View>
                {/* 菜品描述 */}
                <View className="food-describe">{dish.desc || "暂无描述"}</View>
                {/* 销量信息 */}
                <View className="food-sales">销量:{dish.sales}</View>
                {/* 价格信息 */}
                <View className="food-price">¥ {dish.price}</View>

                {/* 条件渲染：显示输入框或加购按钮 */}
                {showInputNumbers[dish.id] ? (
                  // 显示输入框的情况
                  <View className="food-inputNumber">
                    <InputNumber
                      defaultValue={1} // 默认值为1
                      min={1} // 最小值为1
                      value={inputValues[dish.id]} // 当前值
                      onChange={(value) => handleValueChange(value, dish.id)} // 值变化处理
                      onMinus={() => handleMinusClick(dish.id)} // 减号点击处理
                    />
                  </View>
                ) : (
                  // 显示加购按钮的情况
                  <View
                    // 根据条件添加warning类名，控制按钮颜色
                    className={`food-input ${
                      inputValues[dish.id] === 1 && !showInputNumbers[dish.id]
                        ? "warning"
                        : ""
                    }`}
                    onClick={() => toggleInputNumber(dish.id)} // 点击处理
                  >
                    <image src={plusIcon}></image>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      ))}
      <View className="product-order">
        <Badge
          style={{
            marginInlineEnd: "10px",
            "--nutui-badge-height": "12px",
            "--nutui-badge-padding": "0 3px",
            "--nutui-badge-font-size": "10px",
            "--nutui-badge-min-width": "3px",
          }}
          value={8}
        >
          <image src={shoppingCar} mode="aspectFit" />
        </Badge>
        <View className="product-dine">开炫</View>
      </View>
    </View>
  );
};

// 导出组件
export default ProductList;
