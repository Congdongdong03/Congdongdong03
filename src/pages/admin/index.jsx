import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import {
  Button,
  Toast,
  Tabs,
  Cell,
  InputNumber,
  Avatar,
} from "@nutui/nutui-react-taro";
import {
  fetchAllOrders,
  updateOrderStatus,
  fetchAllUsers,
  rewardPoints,
  fetchAllDishes,
} from "../../services/api";
import Taro from "@tarojs/taro";
import "./index.scss";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, usersData, dishesData] = await Promise.all([
        fetchAllOrders(),
        fetchAllUsers(),
        fetchAllDishes(),
      ]);
      setOrders(ordersData);
      setUsers(usersData);
      setDishes(dishesData);
    } catch (error) {
      console.error("加载数据失败:", error);
      Toast.show({
        type: "fail",
        content: "加载数据失败",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "待处理",
      in_progress: "处理中",
      completed: "已完成",
      cancelled: "已取消",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: "#ff9500",
      in_progress: "#007aff",
      completed: "#34c759",
      cancelled: "#ff3b30",
    };
    return colorMap[status] || "#666";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

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

  const handleRewardPoints = async (userOpenid, points) => {
    try {
      const result = await rewardPoints(userOpenid, points);
      if (result.success) {
        Toast.show({
          type: "success",
          content: `成功奖励 ${points} 积分！`,
          duration: 2000,
        });
        loadData(); // 重新加载数据
      } else {
        throw new Error("奖励失败");
      }
    } catch (error) {
      console.error("奖励积分失败:", error);
      Toast.show({
        type: "fail",
        content: "奖励失败，请重试",
        duration: 2000,
      });
    }
  };

  if (loading) {
    return (
      <View className="admin-page">
        <View className="loading">加载中...</View>
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
                <View key={order._id} className="order-card">
                  <View className="order-header">
                    <Text className="order-time">
                      {formatDate(order.createTime)}
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

                  <View className="order-footer">
                    <Text className="order-total">
                      总计: {order.totalPoints} 积分
                    </Text>
                    <View className="order-actions">
                      {order.status === "pending" && (
                        <>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() =>
                              handleOrderStatusChange(order._id, "in_progress")
                            }
                          >
                            接单
                          </Button>
                          <Button
                            size="small"
                            type="danger"
                            onClick={() =>
                              handleOrderStatusChange(order._id, "cancelled")
                            }
                          >
                            取消
                          </Button>
                        </>
                      )}
                      {order.status === "in_progress" && (
                        <Button
                          size="small"
                          type="success"
                          onClick={() =>
                            handleOrderStatusChange(order._id, "completed")
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
                <View key={user._id} className="user-card">
                  <View className="user-info">
                    <Avatar src={user.avatar} size="normal" />
                    <View className="user-details">
                      <Text className="user-name">{user.nickname}</Text>
                      <Text className="user-points">💰 {user.points} 积分</Text>
                    </View>
                  </View>
                  <View className="reward-actions">
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleRewardPoints(user.openid, 10)}
                    >
                      +10分
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleRewardPoints(user.openid, 50)}
                    >
                      +50分
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleRewardPoints(user.openid, 100)}
                    >
                      +100分
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
              <View key={dish._id} className="dish-card">
                <View className="dish-info">
                  <Text className="dish-name">{dish.name}</Text>
                  <Text className="dish-category">{dish.category}</Text>
                  <Text className="dish-price">{dish.price} 积分</Text>
                  <Text className="dish-sales">销量: {dish.sales}</Text>
                </View>
                <View className="dish-actions">
                  <Button
                    size="small"
                    type="danger"
                    onClick={() => {
                      Toast.show({
                        type: "text",
                        content: "删除功能暂未开放",
                        duration: 2000,
                      });
                    }}
                  >
                    删除
                  </Button>
                </View>
              </View>
            ))}
          </ScrollView>
        </Tabs.TabPane>
      </Tabs>
    </View>
  );
};

export default AdminPage;
