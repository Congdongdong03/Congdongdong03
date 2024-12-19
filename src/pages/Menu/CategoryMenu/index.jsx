import { View } from "@tarojs/components";
import React, { useState } from "react";
import { InputNumber, Badge } from "@nutui/nutui-react-taro";
import ProductImage from "../../../components/index";
import plusIcon from "../../../assets/icons/plus.png";
import shoppingCar from "../../../assets/icons/shoppingcar.png";
import "./index.scss";

const CategoryMenu = ({ categories }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showInputNumbers, setShowInputNumbers] = useState({});
  const [inputValues, setInputValues] = useState({});

  const handleCategoryClick = (id) => {
    setSelectedCategory(id);
  };

  const toggleInputNumber = (dishId) => {
    setShowInputNumbers((prevState) => ({
      ...prevState,
      [dishId]: !prevState[dishId],
    }));
    setInputValues((prevState) => ({
      ...prevState,
      [dishId]: 1,
    }));
  };

  const handleValueChange = (value, dishId) => {
    setInputValues((prevState) => ({
      ...prevState,
      [dishId]: value,
    }));
  };

  const handleMinusClick = (dishId) => {
    const currentValue = inputValues[dishId];
    if (currentValue === 1) {
      setShowInputNumbers((prevState) => ({
        ...prevState,
        [dishId]: false,
      }));
    }
  };

  return (
    <View className="menu-box">
      <View className="category-menu">
        {categories.map((item) => (
          <View
            key={item.id}
            value={item.name}
            className={`menu-item ${
              selectedCategory === item.id ? "active" : ""
            }`}
            onClick={() => handleCategoryClick(item.id)}
          >
            {item.name}
          </View>
        ))}
      </View>

      <View className="product-list">
        {categories.map((category) => (
          <View key={category.id}>
            <View className="category-title">{category.name}</View>
            {category.dishes?.map((dish) => (
              <View key={dish.id} className="all-food">
                <View className="product-Picture">
                  <ProductImage src={dish.avatar} mode="aspectFit" />
                </View>
                <View className="food-info">
                  <View className="food-name">{dish.name}</View>
                  <View className="food-describe">
                    {dish.desc || "暂无描述"}
                  </View>
                  <View className="food-sales">销量:{dish.sales}</View>
                  <View className="food-price">¥ {dish.price}</View>

                  {showInputNumbers[dish.id] ? (
                    <View className="food-inputNumber">
                      <InputNumber
                        defaultValue={1}
                        min={1}
                        value={inputValues[dish.id]}
                        onChange={(value) => handleValueChange(value, dish.id)}
                        onMinus={() => handleMinusClick(dish.id)}
                      />
                    </View>
                  ) : (
                    <View
                      className={`food-input ${
                        inputValues[dish.id] === 1 && !showInputNumbers[dish.id]
                          ? "warning"
                          : ""
                      }`}
                      onClick={() => toggleInputNumber(dish.id)}
                    >
                      <image src={plusIcon}></image>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>

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

export default CategoryMenu;
