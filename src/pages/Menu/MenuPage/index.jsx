import React, { useEffect, useState } from "react";
import { View } from "@tarojs/components";
import BusinessHeader from "../BusinessHeader";
import CategoryMenu from "../CategoryMenu";
import Taro from "@tarojs/taro";
import "./index.scss";
import { fetchCategories } from "../../../services/api";

const MenuPage = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        console.log("接口调用成功：", data);
        setCategories(data);
      })
      .catch((err) => {
        console.error("接口调用失败：", err);
      });
  }, []);

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
    return <View>加载出错</View>;
  }
};

export default MenuPage;
