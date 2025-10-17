import { View, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import React from "react";
import { useState, useEffect } from "react";
import { getCurrentUser, getNoticeText } from "../../../services/api";
import { getUserInfo } from "../../../utils/userInfo";
import { Toast } from "@nutui/nutui-react-taro";
import "./index.scss";

const BusinessHeader = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDisplayInfo, setUserDisplayInfo] = useState({
    nickname: "亲爱的",
    avatar: "",
    hasAuthorized: false,
  });
  const [noticeText, setNoticeText] = useState("欢迎光临，请按需点餐~");
  const [noticeLoading, setNoticeLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
    loadNoticeText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行一次

  const loadCurrentUser = async () => {
    try {
      // 获取后端用户信息（角色、积分等）
      const user = await getCurrentUser();
      setCurrentUser(user);

      // 获取本地缓存的用户显示信息（头像、名字）
      const displayInfo = getUserInfo();
      setUserDisplayInfo(displayInfo);
    } catch (error) {
      console.error("获取用户信息失败:", error);
      // 使用默认值
      const displayInfo = getUserInfo();
      setUserDisplayInfo(displayInfo);

      // 在开发环境显示错误提示
      if (process.env.NODE_ENV === "development") {
        Toast.show({
          type: "text",
          content: "获取用户信息失败，使用默认信息",
          duration: 2000,
        });
      }
    }
  };

  const loadNoticeText = async () => {
    try {
      setNoticeLoading(true);
      const response = await getNoticeText();
      setNoticeText(response.noticeText);
    } catch (error) {
      console.error("获取温馨提示失败:", error);
      // 使用默认值
      setNoticeText("欢迎光临，请按需点餐~");
    } finally {
      setNoticeLoading(false);
    }
  };

  // 点击头像跳转到个人中心
  const handleAvatarClick = () => {
    Taro.switchTab({
      url: "/pages/profile/index",
    });
  };

  const handleAddDish = () => {
    Taro.navigateTo({
      url: "/subpackages/admin/add-dish/index",
    });
  };

  return (
    <View className="business-header">
      <View className="header-area">
        {/* 头像 - 点击跳转到个人中心 */}
        <View className="header-userPicture" onClick={handleAvatarClick}>
          <Image src={userDisplayInfo.avatar} mode="aspectFit" />
        </View>
        <View className="business-info">
          <View className="business-details">{userDisplayInfo.nickname}</View>
          <View className="business-role">
            {currentUser?.role === "chef" ? "👨‍🍳 大厨" : "🍽️ 食客"}
          </View>
        </View>
        <View className="add-dish-btn" onClick={handleAddDish}>
          <Text className="add-dish-text">➕ 添加新菜</Text>
        </View>
      </View>
      <View className="notice-area">
        <View className="notice-info">
          <View className="notice-title">💡 温馨提示：</View>
          <View className="notice-content">
            {noticeLoading ? "加载中..." : noticeText}
          </View>
        </View>
      </View>
    </View>
  );
};

export default BusinessHeader;
