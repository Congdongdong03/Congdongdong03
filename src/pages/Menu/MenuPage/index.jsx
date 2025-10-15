import React from "react";
import { useEffect, useState } from "react";
import { View, Text } from "@tarojs/components";
import BusinessHeader from "../BusinessHeader";
import CategoryMenu from "../CategoryMenu";
import Taro from "@tarojs/taro";
import "./index.scss";
import { fetchCategoriesWithDishes } from "../../../services/api";

const MenuPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("MenuPage useEffect 开始执行");
    fetchCategoriesWithDishes()
      .then((data) => {
        console.log("接口调用成功：", data);
        console.log("数据长度：", data?.length);
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("接口调用失败：", err);
        setLoading(false);
      });
  }, []);

  // 加载状态
  if (loading) {
    return (
      <View className="menu-page loading-page">
        <View className="loading-container">
          <Text className="loading-text">加载中...</Text>
        </View>
      </View>
    );
  }

  // 调试信息
  console.log("MenuPage render - categories:", categories);
  console.log("MenuPage render - loading:", loading);

  try {
    return (
      <View className="menu-page" style={{ height: "100vh" }}>
        <View
          className="business-info"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <BusinessHeader />
        </View>

        <View
          className="content-wrapper"
          style={{
            height: "calc(100vh - 130px)",
            overflowY: "auto",
          }}
        >
          {/* 移除了单独的category-menu和product-list容器，因为它们现在在CategoryMenu组件中统一管理 */}
          <CategoryMenu categories={categories} />
        </View>
      </View>
    );
  } catch (error) {
    console.error("MenuPage render error:", error);
    return (
      <View className="menu-page error-page">
        <View className="error-container">
          <Text className="error-text">加载出错</Text>
        </View>
      </View>
    );
  }
};

export default MenuPage;
