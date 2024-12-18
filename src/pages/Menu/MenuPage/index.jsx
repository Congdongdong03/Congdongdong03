import React, { useEffect, useState } from "react";
import { View } from "@tarojs/components";
import BusinessHeader from "../BusinessHeader";
import CategoryMenu from "../CategoryMenu";
import ProductList from "../ProductList";
import Taro from "@tarojs/taro";
import "./index.scss";

const MenuPage = () => {
  // 将 useState 移到组件内部，这是正确的位置
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Taro.request({
      url: "http://127.0.0.1:8000/cuisine/",
      method: "GET",
      success: (res) => {
        // 使用箭头函数
        console.log("接口调用成功");
        console.log("接口调用成功：", res.data);
        setCategories(res.data);
      },
      fail: (err) => {
        console.log("接口调用失败：", err);
      },
    });
  }, []);

  console.log("页面开始渲染");

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
          <View
            className="category-menu"
            style={{ overflowY: "auto", backgroundColor: "rgb(255, 220, 230)" }}
          >
            <CategoryMenu categories={categories} />
          </View>
          <View className="product-list" style={{ overflowY: "auto" }}>
            <ProductList categories={categories} />
          </View>
        </View>
      </View>
    );
  } catch (error) {
    console.error("MenuPage render error:", error);
    return <View>加载出错</View>;
  }
};

export default MenuPage;
