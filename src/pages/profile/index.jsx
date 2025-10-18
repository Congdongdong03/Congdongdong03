import React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Input,
  Button as TaroButton,
} from "@tarojs/components";
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
import {
  getUserInfo,
  saveUserInfo,
  saveAndSyncUserInfo,
} from "../../utils/userInfo";
import Taro from "@tarojs/taro";
import "./index.scss";

const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDisplayInfo, setUserDisplayInfo] = useState({
    nickname: "微信用户",
    avatar: "",
    hasAuthorized: false,
  });

  // 温馨提示编辑相关状态
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [noticeText, setNoticeText] = useState("");
  const [editingNoticeText, setEditingNoticeText] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  // 首次进入引导弹窗
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

  useEffect(() => {
    loadUserInfo(); // 首次加载

    // 定时刷新（每 30 秒）
    const refreshTimer = setInterval(() => {
      loadUserInfo();
    }, 30000);

    // 清理定时器
    return () => clearInterval(refreshTimer);
  }, []);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      // 获取后端用户信息（角色、积分、头像、昵称等）
      const user = await getCurrentUser();
      setCurrentUser(user);

      // 🔧 统一使用后端数据作为权威数据源
      // 后端返回的用户信息一定是最新、最准确的
      const backendDisplayInfo = {
        nickname: user.nickname || "微信用户",
        avatar: user.avatar || "",
        hasAuthorized: user.nickname !== "微信用户" && !!user.nickname, // 只有用户修改过昵称才算已授权
      };

      // 同步到本地缓存
      saveUserInfo(backendDisplayInfo.nickname, backendDisplayInfo.avatar);
      setUserDisplayInfo(backendDisplayInfo);

      console.log("✅ 使用后端用户数据:", backendDisplayInfo);
      console.log(
        `📊 用户状态 - 昵称: ${backendDisplayInfo.nickname}, 积分: ${user.points}, 角色: ${user.role}`
      );

      // 🎉 如果用户未设置个人信息（昵称仍是默认值），显示欢迎引导弹窗
      if (!backendDisplayInfo.hasAuthorized) {
        // 延迟500ms显示，让页面先加载完成
        setTimeout(() => {
          setShowWelcomeDialog(true);
        }, 500);
      }
    } catch (error) {
      console.error("加载用户信息失败:", error);
      Toast.show({
        type: "fail",
        content: "加载用户信息失败",
        duration: 2000,
      });
      // 使用本地缓存作为备用
      const displayInfo = getUserInfo();
      setUserDisplayInfo(displayInfo);
    } finally {
      setLoading(false);
    }
  };

  // 处理头像选择（微信新版API）
  const handleChooseAvatar = async (e) => {
    try {
      const { avatarUrl } = e.detail;
      console.log("📸 用户选择了头像:", avatarUrl);

      // 保存头像（使用当前昵称）
      const result = await saveAndSyncUserInfo(
        userDisplayInfo.nickname,
        avatarUrl
      );

      if (result.success) {
        setUserDisplayInfo({
          ...userDisplayInfo,
          avatar: avatarUrl,
          hasAuthorized: true,
        });
        Toast.show({
          type: "success",
          content: "头像更新成功！",
          duration: 2000,
        });
        // 刷新用户信息
        loadUserInfo();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("更新头像失败:", error);
      Toast.show({
        type: "fail",
        content: "头像更新失败: " + error.message,
        duration: 2000,
      });
    }
  };

  // 处理昵称输入（微信新版API - 用户点击键盘完成按钮时触发）
  const handleNicknameConfirm = async (e) => {
    try {
      const { value } = e.detail;
      console.log("✏️ 用户确认了昵称:", value);

      if (!value || !value.trim()) {
        Toast.show({
          type: "warn",
          content: "昵称不能为空",
          duration: 2000,
        });
        return;
      }

      // 保存昵称（使用当前头像）
      const result = await saveAndSyncUserInfo(value, userDisplayInfo.avatar);

      if (result.success) {
        setUserDisplayInfo({
          ...userDisplayInfo,
          nickname: value,
          hasAuthorized: true,
        });

        // Close welcome dialog after successful nickname update
        setShowWelcomeDialog(false);

        Toast.show({
          type: "success",
          content: "昵称更新成功！",
          duration: 2000,
        });

        // Refresh user info to get updated role
        loadUserInfo();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("更新昵称失败:", error);
      Toast.show({
        type: "fail",
        content: "昵称更新失败: " + error.message,
        duration: 2000,
      });
    }
  };

  // 处理昵称失去焦点（备用方案）
  const handleNicknameBlur = async (e) => {
    const { value } = e.detail;
    // 如果昵称有变化，也保存一下
    if (value && value.trim() && value !== userDisplayInfo.nickname) {
      handleNicknameConfirm(e);
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

  // 获取当前用户的 OpenID（开发者工具）
  const handleGetOpenId = async () => {
    console.log("🔑 开始获取 OpenID...");

    try {
      Toast.show({
        type: "loading",
        content: "正在获取...",
        duration: 0,
      });

      // 调用微信登录获取 code
      console.log("📱 调用 Taro.login()...");
      const loginRes = await Taro.login();
      console.log("✅ 登录成功，code:", loginRes.code);
      const code = loginRes.code;

      if (!code) {
        console.error("❌ 未获取到 code");
        Toast.hide();
        Toast.show({
          type: "fail",
          content: "获取登录凭证失败",
          duration: 2000,
        });
        return;
      }

      // 调用后端接口换取 OpenID
      console.log("🌐 调用后端接口，code:", code);
      const response = await Taro.request({
        url: `https://congdongdong03.onrender.com/api/wechat/get-openid?code=${code}`,
        method: "GET",
      });

      console.log("📥 后端响应:", response.data);
      Toast.hide();

      // 🔧 兼容新旧两种响应格式
      let openid = null;
      if (response.data.success && response.data.data) {
        // 新格式：{ success: true, data: { openid, ... } }
        openid = response.data.data.openid;
      } else if (response.data.openid) {
        // 旧格式：{ openid, session_key, user }
        openid = response.data.openid;
      }

      if (openid) {
        console.log("✅ 获取到 OpenID:", openid);

        // 复制到剪贴板
        await Taro.setClipboardData({
          data: openid,
        });

        Dialog.alert({
          title: "OpenID 已复制",
          content: `OpenID: ${openid}\n\n已复制到剪贴板！`,
        });
      } else {
        console.error("❌ 响应格式错误:", response.data);
        Toast.show({
          type: "fail",
          content: response.data.message || "获取 OpenID 失败",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("❌ 获取 OpenID 失败:", error);
      Toast.hide();
      Toast.show({
        type: "fail",
        content: `获取失败: ${error.message || "未知错误"}`,
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
          {/* 使用微信新版 open-type="chooseAvatar" 获取头像 */}
          <TaroButton
            className="avatar-button"
            openType="chooseAvatar"
            onChooseAvatar={handleChooseAvatar}
          >
            <Avatar
              size="large"
              src={userDisplayInfo.avatar}
              className="user-avatar"
            />
          </TaroButton>

          <View className="user-details">
            {/* 使用微信新版 type="nickname" 获取昵称 */}
            <Input
              type="nickname"
              className="nickname-input"
              value={userDisplayInfo.nickname}
              onConfirm={handleNicknameConfirm}
              onBlur={handleNicknameBlur}
              placeholder="点击输入昵称"
              confirmType="done"
            />
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
              <Text className="auth-hint-text">点击头像选择，点击昵称编辑</Text>
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

        {/* 开发者工具 */}
        <View className="developer-section">
          <Text className="section-title">开发者工具</Text>
          <Cell
            title="🔑 获取 OpenID"
            desc="获取当前用户的微信 OpenID"
            isLink
            onClick={() => {
              console.log("🖱️ Cell 被点击了！");
              handleGetOpenId();
            }}
            className="developer-cell"
          />
          {/* 开发环境显示缓存测试 */}
          {process.env.NODE_ENV === "development" && (
            <Cell
              title="🧪 缓存测试"
              desc="测试和清除用户缓存"
              isLink
              onClick={() => {
                Taro.navigateTo({
                  url: "/pages/test-cache/index",
                });
              }}
              className="developer-cell"
            />
          )}
        </View>
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

      {/* 首次进入欢迎引导弹窗 */}
      <Dialog
        title="🎉 欢迎来到点餐小程序"
        visible={showWelcomeDialog}
        onConfirm={() => setShowWelcomeDialog(false)}
        confirmText="知道了"
        closeOnOverlayClick={false}
      >
        <View className="welcome-dialog">
          <Text className="welcome-text">
            您好！为了获得更好的体验，请设置您的个人信息：
          </Text>
          <View className="welcome-steps">
            <Text className="step-item">1️⃣ 点击头像，选择您的头像</Text>
            <Text className="step-item">2️⃣ 点击昵称，输入您的名字</Text>
          </View>
          <Text className="welcome-hint">
            设置后，您的积分记录和订单将与您的账号绑定。
          </Text>
        </View>
      </Dialog>
    </View>
  );
};

export default ProfilePage;
