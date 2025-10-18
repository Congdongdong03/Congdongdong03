import React from "react";
import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import {
  Button,
  Toast,
  Tabs,
  Cell,
  InputNumber,
  Avatar,
  Dialog,
} from "@nutui/nutui-react-taro";
import {
  fetchAllOrders,
  updateOrderStatus,
  fetchAllUsers,
  rewardPoints,
  fetchAllDishes,
  updateDish,
  deleteDish,
  cancelOrder,
} from "../../../services/api";
import { formatDate } from "../../../utils/formatDate";
import { getStatusText, getStatusColor } from "../../../utils/statusHelper";
import Taro, { useDidShow } from "@tarojs/taro";
import "./index.scss";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPointsInput, setUserPointsInput] = useState({}); // 每个用户的积分输入状态
  const [showRewardDialog, setShowRewardDialog] = useState(false); // 奖励结果弹窗
  const [rewardResult, setRewardResult] = useState({
    success: false,
    message: "",
    points: 0,
    userName: "",
  }); // 奖励结果信息

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("🔄 开始加载管理页面数据...");

      // 先测试简单的数据加载
      console.log("🔍 测试API调用...");

      const [ordersData, usersData, dishesData] = await Promise.all([
        fetchAllOrders().catch((err) => {
          console.error("❌ fetchAllOrders 失败:", err);
          return [];
        }),
        fetchAllUsers().catch((err) => {
          console.error("❌ fetchAllUsers 失败:", err);
          return [];
        }),
        fetchAllDishes().catch((err) => {
          console.error("❌ fetchAllDishes 失败:", err);
          return [];
        }),
      ]);

      console.log("📊 数据加载完成:", {
        orders: ordersData?.length || 0,
        users: usersData?.length || 0,
        dishes: dishesData?.length || 0,
      });

      setOrders(ordersData || []);
      setUsers(usersData || []);
      setDishes(dishesData || []);
    } catch (error) {
      console.error("❌ 加载数据失败:", error);
      Toast.show({
        type: "fail",
        content: `加载数据失败: ${error.message}`,
        duration: 3000,
      });
      // 设置默认空数据，确保页面能显示
      setOrders([]);
      setUsers([]);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🏗️ AdminPage 组件已加载");
    loadData();
  }, []);

  // 页面每次显示时自动刷新
  useDidShow(() => {
    console.log("AdminPage 页面显示，刷新管理数据");
    loadData();
  });

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      Toast.show({
        type: "success",
        content: "订单状态更新成功",
        duration: 2000,
      });
      loadData(); // 重新加载数据
    } catch (error) {
      console.error("更新订单状态失败:", error);
      Toast.show({
        type: "fail",
        content: "更新失败，请重试",
        duration: 2000,
      });
    }
  };

  // 🆕 大厨取消订单（会退还积分和库存）
  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId);
      Toast.show({
        type: "success",
        content: "订单已取消，积分和库存已退还",
        duration: 2000,
      });
      loadData(); // 重新加载数据
    } catch (error) {
      console.error("取消订单失败:", error);
      const errorMessage =
        error.data?.error || error.message || "取消失败，请重试";
      Toast.show({
        type: "fail",
        content: errorMessage,
        duration: 2000,
      });
    }
  };

  const handleRewardPoints = async (userOpenid, userId) => {
    const points = userPointsInput[userId];
    const user = users.find((u) => u.id === userId);
    const userName = user ? user.nickname : "用户";

    // 验证输入
    if (!points || points <= 0) {
      setRewardResult({
        success: false,
        message: "请输入有效的积分数值",
        points: 0,
        userName: userName,
      });
      setShowRewardDialog(true);
      return;
    }

    try {
      console.log(`🎁 开始奖励积分: ${userName} +${points} 积分`);

      const result = await rewardPoints(userOpenid, points);
      // 检查响应是否包含用户和积分历史记录
      if (result && result.user && result.history) {
        console.log(`✅ 积分奖励成功: ${userName} +${points} 积分`);

        setRewardResult({
          success: true,
          message: `成功奖励 ${points} 积分！`,
          points: points,
          userName: userName,
        });
        setShowRewardDialog(true);

        // 清空输入框
        setUserPointsInput((prev) => ({ ...prev, [userId]: undefined }));

        // 重新加载数据
        loadData();
      } else {
        throw new Error("奖励失败");
      }
    } catch (error) {
      console.error("❌ 奖励积分失败:", error);

      setRewardResult({
        success: false,
        message: `奖励失败: ${error.message || "请重试"}`,
        points: points,
        userName: userName,
      });
      setShowRewardDialog(true);
    }
  };

  // 编辑菜品
  const handleEditDish = (dish) => {
    Taro.navigateTo({
      url: `/subpackages/admin/add-dish/index?edit=true&dishId=${dish.id}`,
    });
  };

  // 删除菜品
  const handleDeleteDish = async (dish) => {
    try {
      await deleteDish(dish.id);
      Toast.show({
        type: "success",
        content: "菜品删除成功！",
        duration: 2000,
      });
      loadData(); // 重新加载数据
    } catch (error) {
      console.error("删除菜品失败:", error);
      const errorMessage = error.data?.error || error.message || "删除失败";
      Toast.show({
        type: "fail",
        content: errorMessage,
        duration: 2000,
      });
    }
  };

  // 添加一个简单的备用UI用于测试
  if (loading) {
    return (
      <View className="admin-page">
        <View className="admin-header">
          <Text className="page-title">👨‍🍳 管理面板</Text>
          <Text className="page-subtitle">大厨专用管理界面</Text>
        </View>
        <View className="loading">
          <Text>🔄 正在加载数据...</Text>
          <Text>请稍候...</Text>
        </View>
      </View>
    );
  }

  // 添加错误状态显示
  if (!orders && !users && !dishes) {
    return (
      <View className="admin-page">
        <View className="admin-header">
          <Text className="page-title">👨‍🍳 管理面板</Text>
          <Text className="page-subtitle">大厨专用管理界面</Text>
        </View>
        <View className="error-state">
          <Text>❌ 数据加载失败</Text>
          <Button onClick={loadData}>重试</Button>
        </View>
      </View>
    );
  }

  return (
    <View className="admin-page">
      <View className="admin-header">
        <Text className="page-title">👨‍🍳 管理面板</Text>
        <Text className="page-subtitle">大厨专用管理界面</Text>
      </View>

      <Tabs value={activeTab} onChange={setActiveTab} className="admin-tabs">
        <Tabs.TabPane title="订单管理" value={0}>
          <ScrollView scrollY className="tab-content">
            {orders.length === 0 ? (
              <View className="empty-state">
                <Text className="empty-text">暂无订单</Text>
              </View>
            ) : (
              orders.map((order) => (
                <View key={order.id} className="order-card">
                  <View className="order-header">
                    <Text className="order-time">
                      {formatDate(order.createdAt)}
                    </Text>
                    <Text
                      className="order-status"
                      style={{ color: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </Text>
                  </View>

                  <View className="order-items">
                    {order.items.map((item, index) => (
                      <View key={index} className="order-item">
                        <Text className="item-name">{item.name}</Text>
                        <Text className="item-quantity">×{item.quantity}</Text>
                        <Text className="item-price">{item.price}积分</Text>
                      </View>
                    ))}
                  </View>

                  {/* 订单备注显示 */}
                  {order.remark && order.remark.trim() && (
                    <View className="order-remark">
                      <Text className="remark-label">📝 备注：</Text>
                      <Text className="remark-content">{order.remark}</Text>
                    </View>
                  )}

                  <View className="order-footer">
                    <Text className="order-total">
                      总计: {order.totalPoints} 积分
                    </Text>
                    <View className="order-actions">
                      {order.status === "PENDING" && (
                        <>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() =>
                              handleOrderStatusChange(order.id, "IN_PROGRESS")
                            }
                          >
                            接单
                          </Button>
                          <Button
                            size="small"
                            type="danger"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            取消
                          </Button>
                        </>
                      )}
                      {order.status === "IN_PROGRESS" && (
                        <Button
                          size="small"
                          type="success"
                          onClick={() =>
                            handleOrderStatusChange(order.id, "COMPLETED")
                          }
                        >
                          完成
                        </Button>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </Tabs.TabPane>

        <Tabs.TabPane title="积分管理" value={1}>
          <ScrollView scrollY className="tab-content">
            {users.length === 0 ? (
              <View className="empty-state">
                <Text className="empty-text">暂无用户</Text>
              </View>
            ) : (
              users.map((user) => (
                <View key={user.id} className="user-card">
                  <View className="user-info">
                    <Avatar
                      src={user.avatar || ""}
                      size="normal"
                      icon={!user.avatar ? "my" : undefined}
                    />
                    <View className="user-details">
                      <Text className="user-name">
                        {user.nickname}
                        {user.nickname === "微信用户" && (
                          <Text className="user-status-hint"> (未设置)</Text>
                        )}
                      </Text>
                      <Text className="user-points">💰 {user.points} 积分</Text>
                    </View>
                  </View>
                  <View className="reward-input-section">
                    <InputNumber
                      value={userPointsInput[user.id] || undefined}
                      onChange={(value) =>
                        setUserPointsInput((prev) => ({
                          ...prev,
                          [user.id]: value,
                        }))
                      }
                      min={1}
                      placeholder="输入积分"
                    />
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleRewardPoints(user.openid, user.id)}
                    >
                      奖励
                    </Button>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </Tabs.TabPane>

        <Tabs.TabPane title="菜品管理" value={2}>
          <ScrollView scrollY className="tab-content">
            <View className="dish-stats">
              <Text className="stats-title">菜品统计</Text>
              <Text className="stats-count">共 {dishes.length} 道菜品</Text>
            </View>

            {dishes.map((dish) => (
              <View key={dish.id} className="dish-card">
                <View className="dish-info">
                  <Text className="dish-name">{dish.name}</Text>
                  <Text className="dish-category">
                    {dish.category?.name || "未分类"}
                  </Text>
                  <Text className="dish-price">{dish.price} 积分</Text>
                  <Text className="dish-sales">销量: {dish.sales}</Text>
                </View>
                <View className="dish-actions">
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => handleEditDish(dish)}
                    className="edit-dish-btn"
                  >
                    编辑
                  </Button>
                  <Button
                    size="small"
                    type="danger"
                    onClick={() => handleDeleteDish(dish)}
                    className="delete-dish-btn"
                  >
                    删除
                  </Button>
                </View>
              </View>
            ))}
          </ScrollView>
        </Tabs.TabPane>

        <Tabs.TabPane title="分类管理" value={3}>
          <ScrollView scrollY className="tab-content">
            <View className="category-management-section">
              <Text className="section-title">分类管理</Text>
              <Text className="section-desc">
                管理菜品分类，添加、编辑或删除分类
              </Text>

              <Button
                type="primary"
                size="large"
                onClick={() =>
                  Taro.navigateTo({
                    url: "/subpackages/admin/category-management/index",
                  })
                }
                className="manage-category-button"
              >
                📂 进入分类管理
              </Button>
            </View>
          </ScrollView>
        </Tabs.TabPane>
      </Tabs>

      {/* 积分奖励结果弹窗 */}
      <Dialog
        title={rewardResult.success ? "🎉 奖励成功" : "❌ 奖励失败"}
        visible={showRewardDialog}
        onConfirm={() => setShowRewardDialog(false)}
        confirmText="确定"
        closeOnOverlayClick={false}
      >
        <View className="reward-result-dialog">
          <Text className="reward-user-name">{rewardResult.userName}</Text>
          <Text className="reward-message">{rewardResult.message}</Text>
          {rewardResult.success && rewardResult.points > 0 && (
            <Text className="reward-points">+{rewardResult.points} 积分</Text>
          )}
        </View>
      </Dialog>
    </View>
  );
};

export default AdminPage;
