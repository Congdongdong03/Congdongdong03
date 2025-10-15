import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import React from "react";
import { useState, useEffect } from "react";
import { getCurrentUser } from "../../../services/api";

// 图片引入
import userPicture from "/src/pages/picture/user_picture.jpg";
import "./index.scss";

const BusinessHeader = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      // 先检查是否已授权
      const authSetting = await Taro.getSetting();
      if (!authSetting.authSetting["scope.userInfo"]) {
        // 未授权，显示默认名称
        setCurrentUser({ nickname: "亲爱的", role: "diner" });
        return;
      }

      // 已授权，获取用户信息
      const userInfo = await Taro.getUserInfo();
      const user = await getCurrentUser();
      setCurrentUser({
        ...user,
        nickname: userInfo.userInfo.nickName || "亲爱的",
      });
    } catch (error) {
      console.error("获取用户信息失败:", error);
      // 出错时显示默认名称
      setCurrentUser({ nickname: "亲爱的", role: "diner" });
    }
  };

  const handleAddDish = () => {
    Taro.navigateTo({
      url: "/pages/add-dish/index",
    });
  };

  return (
    <View className="business-header">
      <View className="header-area">
        {/* 图片 */}
        <View className="header-userPicture">
          <image src={userPicture} mode="aspectFit" />
        </View>
        <View className="business-info">
          <View className="business-details">
            {currentUser?.nickname || "亲爱的"}
          </View>
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
            {currentUser?.role === "chef"
              ? "有新的点餐订单会及时通知您~"
              : "点餐后大厨会收到通知，马上开始准备！"}
          </View>
        </View>
      </View>
    </View>
  );
};

export default BusinessHeader;
