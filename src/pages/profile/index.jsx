import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { Button, Avatar, Cell, Toast } from "@nutui/nutui-react-taro";
import { getCurrentUser } from "../../services/api";
import Taro from "@tarojs/taro";
import "./index.scss";

const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("加载用户信息失败:", error);
      Toast.show({
        type: "fail",
        content: "加载用户信息失败",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDish = () => {
    Taro.navigateTo({
      url: "/pages/add-dish/index",
    });
  };

  const handleViewInventory = () => {
    Taro.navigateTo({
      url: "/pages/inventory/index",
    });
  };

  const handleViewShoppingList = () => {
    Taro.navigateTo({
      url: "/pages/shopping-list/index",
    });
  };

  const handleAdminPanel = () => {
    if (currentUser?.role === "chef") {
      Taro.navigateTo({
        url: "/pages/admin/index",
      });
    } else {
      Toast.show({
        type: "text",
        content: "只有大厨才能进入管理面板哦~",
        duration: 2000,
      });
    }
  };

  if (loading) {
    return (
      <View className="profile-page">
        <View className="loading">加载中...</View>
      </View>
    );
  }

  return (
    <View className="profile-page">
      <View className="profile-header">
        <View className="user-info">
          <Avatar
            size="large"
            src={currentUser?.avatar}
            className="user-avatar"
          />
          <View className="user-details">
            <Text className="user-name">{currentUser?.nickname}</Text>
            <Text className="user-role">
              {currentUser?.role === "chef" ? "👨‍🍳 大厨" : "🍽️ 食客"}
            </Text>
            <Text
              className="user-points"
              onClick={() => Taro.navigateTo({ url: "/pages/points/index" })}
            >
              💰 {currentUser?.points} 积分
            </Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className="profile-content">
        <View className="menu-section">
          <Text className="section-title">菜单管理</Text>
          <Cell
            title="添加新菜品"
            desc="向菜单库中添加新菜品"
            onClick={handleAddDish}
            className="menu-cell"
          />
        </View>

        <View className="inventory-section">
          <Text className="section-title">我们的冰箱</Text>
          <Cell
            title="查看库存"
            desc="查看和管理共享库存"
            onClick={handleViewInventory}
            className="inventory-cell"
          />
          <Cell
            title="购物清单"
            desc="查看需要购买的食材"
            onClick={handleViewShoppingList}
            className="shopping-cell"
          />
        </View>

        {currentUser?.role === "chef" && (
          <View className="admin-section">
            <Text className="section-title">管理功能</Text>
            <Cell
              title="管理面板"
              desc="订单管理、积分奖励等"
              onClick={handleAdminPanel}
              className="admin-cell"
            />
          </View>
        )}

        <View className="about-section">
          <Text className="section-title">关于</Text>
          <Cell
            title="项目信息"
            desc="亲爱的，今晚吃什么？"
            className="about-cell"
          />
          <Cell title="版本" desc="v1.0.0" className="version-cell" />
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfilePage;
