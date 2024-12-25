import { View, ScrollView } from "@tarojs/components";
import React, { useState, useEffect, useRef } from "react";
import Taro from "@tarojs/taro";
import { InputNumber, Badge } from "@nutui/nutui-react-taro";
import ProductImage from "../../../components/index";
import plusIcon from "../../../assets/icons/plus.png";
import shoppingCar from "../../../assets/icons/shoppingcar.png";
import "./index.scss";

const CategoryMenu = ({ categories }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showInputNumbers, setShowInputNumbers] = useState({});
  const [inputValues, setInputValues] = useState({});

  useEffect(() => {
    if (categories?.length > 0) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, scrollLeft } = e.detail;
    console.log("滚动事件:", {
      scrollTop,
      scrollHeight,
      scrollLeft,
    });
  };

  const handleCategoryClick = (id) => {
    setSelectedCategory(id);
    // 滚动到对应的分类区域
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

  const toggleInputNumber = (dishId) => {
    setShowInputNumbers((prev) => ({
      ...prev,
      [dishId]: !prev[dishId],
    }));
    setInputValues((prev) => ({
      ...prev,
      [dishId]: 1,
    }));
  };

  const handleValueChange = (value, dishId) => {
    setInputValues((prev) => ({
      ...prev,
      [dishId]: value,
    }));
  };

  const handleMinusClick = (dishId) => {
    const currentValue = inputValues[dishId];
    if (currentValue === 1) {
      setShowInputNumbers((prev) => ({
        ...prev,
        [dishId]: false,
      }));
    }
  };

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
        onScroll={handleScroll}
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
                      className="food-input"
                      onClick={() => toggleInputNumber(dish.id)}
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
          value={8}
          style={{
            marginInlineEnd: "10px",
            "--nutui-badge-height": "12px",
            "--nutui-badge-padding": "0 3px",
            "--nutui-badge-font-size": "10px",
            "--nutui-badge-min-width": "3px",
          }}
        >
          <image src={shoppingCar} mode="aspectFit" />
        </Badge>
        <View className="product-dine">开炫</View>
      </View>
    </View>
  );
};

export default CategoryMenu;
