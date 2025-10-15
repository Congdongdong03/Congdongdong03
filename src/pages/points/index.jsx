import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { Button, Toast, Avatar, Cell } from "@nutui/nutui-react-taro";
import {
  getCurrentUser,
  getPointsHistory,
  rewardPoints,
} from "../../services/api";
import Taro from "@tarojs/taro";
import "./index.scss";

const PointsPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRewardPanel, setShowRewardPanel] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rewardAmount, setRewardAmount] = useState(50);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [user, history, users] = await Promise.all([
        getCurrentUser(),
        getPointsHistory(),
        getAllUsers(),
      ]);
      setCurrentUser(user);
      setPointsHistory(history);
      setAllUsers(users);
    } catch (error) {
      console.error("加载数据失败:", error);
      Toast.show({
        type: "fail",
        content: "加载失败，请重试",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getAllUsers = async () => {
    // 获取所有用户列表（用于积分奖励）
    try {
      const users = await getCurrentUser(); // 这里应该调用获取所有用户的API
      return [users]; // 暂时返回当前用户
    } catch (error) {
      console.error("获取用户列表失败:", error);
      return [];
    }
  };

  const handleRewardPoints = async () => {
    if (!selectedUser) {
      Toast.show({
        type: "fail",
        content: "请选择要奖励的用户",
        duration: 2000,
      });
      return;
    }

    try {
      await rewardPoints(selectedUser._id, rewardAmount);
      Toast.show({
        type: "success",
        content: `成功奖励 ${selectedUser.nickName} ${rewardAmount} 积分！`,
        duration: 2000,
      });
      setShowRewardPanel(false);
      loadData(); // 重新加载数据
    } catch (error) {
      console.error("奖励积分失败:", error);
      Toast.show({
        type: "fail",
        content: "奖励失败，请重试",
        duration: 2000,
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const getPointsText = (points) => {
    return points > 0 ? `+${points}分` : `${points}分`;
  };

  const getPointsColor = (points) => {
    return points > 0 ? "#f9dde6" : "#888888";
  };

  if (loading) {
    return (
      <View className="points-page">
        <View className="loading">加载中...</View>
      </View>
    );
  }

  return (
    <View className="points-page">
      <View className="points-header">
        <Text className="page-title">💰 积分中心</Text>
        <Text className="page-subtitle">查看积分余额和明细</Text>
      </View>

      <ScrollView scrollY className="points-content">
        {/* 积分余额卡片 */}
        <View className="points-balance-card">
          <View className="balance-info">
            <Text className="balance-label">当前积分</Text>
            <Text className="balance-amount">{currentUser?.points || 0}</Text>
          </View>
          <View className="balance-actions">
            {currentUser?.role === "chef" && (
              <Button
                type="primary"
                size="small"
                onClick={() => setShowRewardPanel(true)}
                className="reward-btn"
              >
                🎁 奖励积分
              </Button>
            )}
          </View>
        </View>

        {/* 积分明细 */}
        <View className="points-history">
          <Text className="section-title">积分明细</Text>
          {pointsHistory.length === 0 ? (
            <View className="empty-history">
              <Text className="empty-text">暂无积分记录</Text>
              <Text className="empty-hint">
                开始点餐或获得奖励后会有记录哦~
              </Text>
            </View>
          ) : (
            <View className="history-list">
              {pointsHistory.map((record) => (
                <View key={record._id} className="history-item">
                  <View className="history-info">
                    <Text className="history-desc">{record.description}</Text>
                    <Text className="history-time">
                      {formatDate(record.createTime)}
                    </Text>
                  </View>
                  <View className="history-points">
                    <Text
                      className="points-text"
                      style={{ color: getPointsColor(record.points) }}
                    >
                      {getPointsText(record.points)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 积分奖励面板 */}
      {showRewardPanel && (
        <View
          className="reward-panel-overlay"
          onClick={() => setShowRewardPanel(false)}
        >
          <View className="reward-panel" onClick={(e) => e.stopPropagation()}>
            <View className="reward-header">
              <Text className="reward-title">🎁 奖励积分</Text>
              <Text
                className="reward-close"
                onClick={() => setShowRewardPanel(false)}
              >
                ×
              </Text>
            </View>

            <View className="reward-content">
              <View className="reward-section">
                <Text className="reward-label">选择用户</Text>
                <View className="user-list">
                  {allUsers.map((user) => (
                    <View
                      key={user._id}
                      className={`user-item ${
                        selectedUser?._id === user._id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <Avatar src={user.avatar} size="small" />
                      <Text className="user-name">{user.nickName}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className="reward-section">
                <Text className="reward-label">奖励积分</Text>
                <View className="amount-buttons">
                  {[10, 50, 100, 200].map((amount) => (
                    <Button
                      key={amount}
                      size="small"
                      type={rewardAmount === amount ? "primary" : "default"}
                      onClick={() => setRewardAmount(amount)}
                      className="amount-btn"
                    >
                      +{amount}分
                    </Button>
                  ))}
                </View>
              </View>
            </View>

            <View className="reward-footer">
              <Button
                type="primary"
                size="large"
                onClick={handleRewardPoints}
                disabled={!selectedUser}
                className="confirm-reward-btn"
              >
                确认奖励
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PointsPage;
