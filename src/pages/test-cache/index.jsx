import { View, Text, Button, Input } from "@tarojs/components";
import Taro from "@tarojs/taro";
import React, { useState, useEffect } from "react";
import { clearAllUserCache, getOpenId } from "../../utils/auth";
import { getUserInfo } from "../../utils/userInfo";
import { getCurrentUser } from "../../services/api";
import { Toast } from "@nutui/nutui-react-taro";

const TestCache = () => {
  const [cacheInfo, setCacheInfo] = useState({
    openid: null,
    userInfo: null,
    currentUser: null,
  });

  useEffect(() => {
    loadCacheInfo();
  }, []);

  const loadCacheInfo = async () => {
    try {
      // 获取本地缓存的 OpenID
      const openid = getOpenId();

      // 获取本地缓存的用户信息
      const userInfo = getUserInfo();

      // 尝试获取后端用户信息
      let currentUser = null;
      try {
        currentUser = await getCurrentUser();
      } catch (error) {
        console.log("无法获取后端用户信息:", error.message);
      }

      setCacheInfo({
        openid,
        userInfo,
        currentUser,
      });
    } catch (error) {
      console.error("加载缓存信息失败:", error);
    }
  };

  const handleClearCache = () => {
    Taro.showModal({
      title: "清除所有缓存",
      content: "确定要清除所有用户缓存吗？这将需要重新登录。",
      success: (res) => {
        if (res.confirm) {
          clearAllUserCache();
          Toast.show({
            type: "success",
            content: "缓存已清除！",
            duration: 2000,
          });
          // 重新加载信息
          setTimeout(() => {
            loadCacheInfo();
          }, 1000);
        }
      },
    });
  };

  const handleRefresh = () => {
    loadCacheInfo();
    Toast.show({
      type: "success",
      content: "信息已刷新",
      duration: 1000,
    });
  };

  // 设置用户角色
  const handleSetRole = async () => {
    const openid = cacheInfo.openid;
    if (!openid) {
      Toast.show({
        type: "warn",
        content: "请先登录获取OpenID",
        duration: 2000,
      });
      return;
    }

    Taro.showActionSheet({
      itemList: ["设置为大厨", "设置为食客"],
      success: async (res) => {
        const role = res.tapIndex === 0 ? "chef" : "diner";
        try {
          const response = await Taro.request({
            url: `${
              process.env.NODE_ENV === "development"
                ? "https://localhost:3001"
                : "https://congdongdong03.onrender.com"
            }/api/admin/users/${openid}/role`,
            method: "PUT",
            data: { role },
          });

          if (response.statusCode === 200) {
            Toast.show({
              type: "success",
              content: `角色已设置为${role === "chef" ? "大厨" : "食客"}`,
              duration: 2000,
            });
            // 刷新信息
            setTimeout(() => {
              loadCacheInfo();
            }, 1000);
          }
        } catch (error) {
          console.error("设置角色失败:", error);
          Toast.show({
            type: "fail",
            content: "设置角色失败",
            duration: 2000,
          });
        }
      },
    });
  };

  return (
    <View style={{ padding: "20px" }}>
      <Text
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
      >
        🧪 缓存测试页面
      </Text>

      <View style={{ marginBottom: "20px" }}>
        <Text
          style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}
        >
          📱 本地缓存信息：
        </Text>
        <View
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <Text>OpenID: {cacheInfo.openid || "无"}</Text>
          <Text>昵称: {cacheInfo.userInfo?.nickname || "无"}</Text>
          <Text>头像: {cacheInfo.userInfo?.avatar || "无"}</Text>
          <Text>已授权: {cacheInfo.userInfo?.hasAuthorized ? "是" : "否"}</Text>
        </View>
      </View>

      <View style={{ marginBottom: "20px" }}>
        <Text
          style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}
        >
          🗄️ 后端用户信息：
        </Text>
        <View
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          {cacheInfo.currentUser ? (
            <>
              <Text>ID: {cacheInfo.currentUser.id}</Text>
              <Text>昵称: {cacheInfo.currentUser.nickname}</Text>
              <Text>角色: {cacheInfo.currentUser.role}</Text>
              <Text>积分: {cacheInfo.currentUser.points}</Text>
            </>
          ) : (
            <Text style={{ color: "#ff6b6b" }}>无法获取后端用户信息</Text>
          )}
        </View>
      </View>

      <View style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Button
          type="primary"
          onClick={handleRefresh}
          style={{ marginBottom: "10px" }}
        >
          🔄 刷新信息
        </Button>

        <Button
          type="warn"
          onClick={handleClearCache}
          style={{ marginBottom: "10px" }}
        >
          🧹 清除所有缓存
        </Button>

        <Button
          type="primary"
          onClick={handleSetRole}
          style={{ marginBottom: "10px" }}
        >
          👑 设置用户角色
        </Button>

        <Button onClick={() => Taro.navigateBack()}>← 返回</Button>
      </View>
    </View>
  );
};

export default TestCache;
