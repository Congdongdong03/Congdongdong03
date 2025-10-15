import React from "react";
import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { Button, Avatar, Cell, Toast } from "@nutui/nutui-react-taro";
import { getCurrentUser } from "../../services/api";
import Taro from "@tarojs/taro";
import "./index.scss";

const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myOpenId, setMyOpenId] = useState("");

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

  // 获取当前用户的 OpenID
  const handleGetMyOpenId = async () => {
    try {
      Toast.show({
        type: "loading",
        content: "正在获取 OpenID...",
        duration: 0,
      });

      // 调用微信登录获取 code
      const loginResult = await Taro.login();
      const code = loginResult.code;

      console.log("微信登录 code:", code);

      // 调用后端接口获取 OpenID
      const response = await Taro.request({
        url: "http://localhost:3001/api/wechat/get-openid",
        method: "GET",
        data: { code },
      });

      Toast.hide();

      if (response.statusCode === 200 && response.data.openid) {
        const openid = response.data.openid;
        setMyOpenId(openid);

        // 将 OpenID 复制到剪贴板
        await Taro.setClipboardData({
          data: openid,
        });

        Taro.showModal({
          title: "✅ OpenID 获取成功",
          content: `您的 OpenID 是:\n${openid}\n\n已自动复制到剪贴板！\n\n请将此 OpenID 配置到后端 wechat.config.ts 的 adminOpenId 字段中，这样您就可以接收订单推送通知了！`,
          showCancel: false,
          confirmText: "我知道了",
        });
      } else {
        throw new Error(response.data.error || "获取 OpenID 失败");
      }
    } catch (error) {
      console.error("获取 OpenID 失败:", error);
      Toast.hide();
      Taro.showModal({
        title: "❌ 获取 OpenID 失败",
        content: error.errMsg || error.message || "请稍后重试",
        showCancel: false,
      });
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
            <Cell
              title="🔔 获取我的 OpenID"
              desc="配置后可接收订单推送通知"
              onClick={handleGetMyOpenId}
              className="openid-cell"
            />
            {myOpenId && (
              <View className="openid-display">
                <Text className="openid-label">我的 OpenID:</Text>
                <Text className="openid-value">{myOpenId}</Text>
              </View>
            )}
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
