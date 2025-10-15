import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { Button, Toast } from "@nutui/nutui-react-taro";
import { fetchUserOrders, getCurrentUser } from "../../services/api";
import "./index.scss";

function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);
      const userOrders = await fetchUserOrders(user.openid);
      setOrders(userOrders);
    } catch (error) {
      console.error("加载订单失败:", error);
      Toast.show({
        type: "fail",
        content: "加载订单失败",
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

  if (loading) {
    return (
      <View className="order-page">
        <View className="loading">加载中...</View>
      </View>
    );
  }

  return (
    <View className="order-page">
      <View className="order-header">
        <Text className="page-title">我的订单</Text>
        {currentUser && (
          <Text className="user-points">积分余额: {currentUser.points}</Text>
        )}
      </View>

      <ScrollView scrollY className="order-content">
        {orders.length === 0 ? (
          <View className="empty-orders">
            <Text className="empty-text">还没有订单哦~</Text>
            <Text className="empty-hint">去菜单页面点餐吧！</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order._id} className="order-item">
              <View className="order-header-info">
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
                  <View key={index} className="order-item-detail">
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
                {order.status === "pending" && (
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                      Toast.show({
                        type: "text",
                        content: "请联系大厨取消订单",
                        duration: 2000,
                      });
                    }}
                  >
                    取消订单
                  </Button>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

export default OrderPage;
