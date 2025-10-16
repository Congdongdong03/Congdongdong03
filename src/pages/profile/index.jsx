import React from "react";
import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { Button, Avatar, Cell, Toast } from "@nutui/nutui-react-taro";
import { getCurrentUser } from "../../services/api";
import { getUserInfo, requestUserAuthorization } from "../../utils/userInfo";
import Taro from "@tarojs/taro";
import "./index.scss";

// 默认头像
import userPicture from "/src/pages/picture/user_picture.jpg";

const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDisplayInfo, setUserDisplayInfo] = useState({
    nickname: "亲爱的",
    avatar: userPicture,
    hasAuthorized: false,
  });

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      // 获取后端用户信息（角色、积分等）
      const user = await getCurrentUser();
      setCurrentUser(user);

      // 获取本地缓存的用户显示信息（头像、名字）
      const displayInfo = getUserInfo();
      setUserDisplayInfo(displayInfo);
    } catch (error) {
      console.error("加载用户信息失败:", error);
      Toast.show({
        type: "fail",
        content: "加载用户信息失败",
        duration: 2000,
      });
      // 使用默认值
      const displayInfo = getUserInfo();
      setUserDisplayInfo(displayInfo);
    } finally {
      setLoading(false);
    }
  };

  // 点击头像请求授权
  const handleAvatarClick = async () => {
    if (userDisplayInfo.hasAuthorized) {
      // 已授权，可以显示提示
      Toast.show({
        type: "text",
        content: "已授权",
        duration: 1000,
      });
      return;
    }

    try {
      const result = await requestUserAuthorization();
      if (result.success) {
        setUserDisplayInfo({
          nickname: result.nickname,
          avatar: result.avatar,
          hasAuthorized: true,
        });
        Toast.show({
          type: "success",
          content: "授权成功！",
          duration: 2000,
        });
      } else {
        Toast.show({
          type: "text",
          content: "授权失败，将使用默认信息",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("授权失败:", error);
    }
  };

  const handleViewInventory = () => {
    Taro.navigateTo({
      url: "/pages/inventory/index",
    });
  };

  const handleAdminPanel = () => {
    if (currentUser?.role === "chef") {
      Taro.navigateTo({
        url: "/subpackages/admin/admin/index",
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
            src={userDisplayInfo.avatar}
            className="user-avatar"
            onClick={handleAvatarClick}
          />
          <View className="user-details">
            <Text className="user-name">{userDisplayInfo.nickname}</Text>
            <Text className="user-role">
              {currentUser?.role === "chef" ? "👨‍🍳 大厨" : "🍽️ 食客"}
            </Text>
            <Text
              className="user-points"
              onClick={() =>
                Taro.navigateTo({ url: "/subpackages/user/points/index" })
              }
            >
              💰 {currentUser?.points || 0} 积分
            </Text>
            {!userDisplayInfo.hasAuthorized && (
              <Text className="auth-hint-text">点击头像授权获取微信信息</Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView scrollY className="profile-content">
        {currentUser?.role === "chef" && (
          <View className="admin-section">
            <Text className="section-title">管理功能</Text>
            <Cell
              title="👨‍🍳 管理面板"
              desc="订单管理、积分奖励等"
              onClick={handleAdminPanel}
              className="admin-cell"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ProfilePage;
