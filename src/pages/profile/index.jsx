import React from "react";
import { useState, useEffect } from "react";
import { View, Text, ScrollView, Input } from "@tarojs/components";
import {
  Button,
  Avatar,
  Cell,
  Toast,
  Dialog,
  TextArea,
} from "@nutui/nutui-react-taro";
import {
  getCurrentUser,
  getNoticeText,
  updateNoticeText,
} from "../../services/api";
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

  // 温馨提示编辑相关状态
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [noticeText, setNoticeText] = useState("");
  const [editingNoticeText, setEditingNoticeText] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

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

  // 打开编辑温馨提示弹窗
  const handleEditNotice = async () => {
    // 验证用户角色
    if (currentUser?.role !== "chef") {
      Toast.show({
        type: "warn",
        content: "只有大厨才能编辑温馨提示",
        duration: 2000,
      });
      return;
    }

    try {
      // 获取当前温馨提示
      const response = await getNoticeText();
      setNoticeText(response.noticeText);
      setEditingNoticeText(response.noticeText);
      setShowEditDialog(true);
    } catch (error) {
      console.error("获取温馨提示失败:", error);
      Toast.show({
        type: "fail",
        content: "获取温馨提示失败",
        duration: 2000,
      });
    }
  };

  // 保存温馨提示
  const handleSaveNotice = async () => {
    // 验证用户角色
    if (currentUser?.role !== "chef") {
      Toast.show({
        type: "warn",
        content: "只有大厨才能编辑温馨提示",
        duration: 2000,
      });
      return;
    }

    // 验证输入
    if (!editingNoticeText.trim()) {
      Toast.show({
        type: "warn",
        content: "温馨提示不能为空",
        duration: 2000,
      });
      return;
    }

    if (editingNoticeText.length > 50) {
      Toast.show({
        type: "warn",
        content: "温馨提示不能超过50个字",
        duration: 2000,
      });
      return;
    }

    try {
      setSaveLoading(true);
      // 直接传入userId，避免API重复请求
      await updateNoticeText(editingNoticeText, currentUser.id);

      Toast.show({
        type: "success",
        content: "保存成功！",
        duration: 2000,
      });

      setNoticeText(editingNoticeText);
      setShowEditDialog(false);
    } catch (error) {
      console.error("保存温馨提示失败:", error);
      Toast.show({
        type: "fail",
        content: error.message || "保存失败，请重试",
        duration: 2000,
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingNoticeText(noticeText);
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
              onClick={() => {
                if (!currentUser || loading) {
                  Toast.show({
                    type: "text",
                    content: "加载中，请稍候...",
                    duration: 1000,
                  });
                  return;
                }
                Taro.navigateTo({ url: "/subpackages/user/points/index" });
              }}
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
            <Cell
              title="💬 编辑温馨提示"
              desc="修改菜单页面顶部的温馨提示文字"
              onClick={handleEditNotice}
              className="admin-cell"
            />
          </View>
        )}
      </ScrollView>

      {/* 编辑温馨提示弹窗 */}
      <Dialog
        title="编辑温馨提示"
        visible={showEditDialog}
        onConfirm={handleSaveNotice}
        onCancel={saveLoading ? undefined : handleCancelEdit}
        confirmText={saveLoading ? "保存中..." : "保存"}
        cancelText={saveLoading ? "" : "取消"}
        closeOnOverlayClick={false}
      >
        <View className="edit-notice-dialog">
          <TextArea
            value={editingNoticeText}
            onChange={(value) => setEditingNoticeText(value)}
            placeholder="请输入温馨提示（最多50字）"
            maxLength={50}
            rows={4}
            limitShow
            className="notice-textarea"
          />
          <Text className="notice-hint">
            当前字数：{editingNoticeText.length}/50
          </Text>
        </View>
      </Dialog>
    </View>
  );
};

export default ProfilePage;
