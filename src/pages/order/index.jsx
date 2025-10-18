import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { Button, Toast, Dialog } from "@nutui/nutui-react-taro";
import Taro, { useDidShow } from "@tarojs/taro";
import {
  fetchUserOrders,
  getCurrentUser,
  cancelOrder,
} from "../../services/api";
import { formatDate } from "../../utils/formatDate";
import { getStatusText, getStatusColor } from "../../utils/statusHelper";
import "./index.scss";

function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);
      const userOrders = await fetchUserOrders(user.id); // 使用userId避免重复请求
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

  useEffect(() => {
    loadOrders();
  }, []);

  // 页面每次显示时自动刷新
  useDidShow(() => {
    console.log("OrderPage 页面显示，刷新订单数据");
    loadOrders();
  });

  // 处理取消订单
  const handleCancelOrder = (order) => {
    setSelectedOrderForCancel(order);
    setShowCancelDialog(true);
  };

  // 确认取消订单
  const confirmCancelOrder = async () => {
    if (!selectedOrderForCancel) return;

    const cancelledPoints = selectedOrderForCancel.totalPoints;
    const orderId = selectedOrderForCancel.id;

    try {
      setIsCancelling(true);
      setShowCancelDialog(false);

      await cancelOrder(orderId);

      // 刷新订单列表
      await loadOrders();

      // 只有在订单列表刷新成功后才显示成功提示
      Toast.show({
        type: "success",
        content: `订单已取消，${cancelledPoints} 积分已退还`,
        duration: 2000,
      });
    } catch (error) {
      console.error("取消订单失败:", error);
      const errorMessage =
        error.data?.error || error.errMsg || error.message || "取消订单失败";
      Toast.show({
        type: "fail",
        content: errorMessage,
        duration: 2000,
      });
    } finally {
      setIsCancelling(false);
      setSelectedOrderForCancel(null);
    }
  };

  // 关闭取消弹窗
  const handleCloseCancelDialog = () => {
    setShowCancelDialog(false);
    setSelectedOrderForCancel(null);
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
          // 按创建时间降序排列，最新订单在最前面
          [...orders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((order) => (
              <View key={order.id} className="order-item">
                <View className="order-header-info">
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
                    <View key={index} className="order-item-detail">
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
                  {order.status === "pending" && (
                    <Button
                      size="small"
                      type="primary"
                      loading={
                        isCancelling && selectedOrderForCancel?.id === order.id
                      }
                      disabled={isCancelling}
                      onClick={() => handleCancelOrder(order)}
                    >
                      取消订单
                    </Button>
                  )}
                </View>
              </View>
            ))
        )}
      </ScrollView>

      {/* 取消订单确认弹窗 */}
      <Dialog
        title="取消订单"
        visible={showCancelDialog}
        confirmText="确认取消"
        cancelText="保留订单"
        onConfirm={confirmCancelOrder}
        onCancel={handleCloseCancelDialog}
      >
        <View style={{ padding: "16px 0" }}>
          <Text>确定要取消此订单吗？</Text>
          {selectedOrderForCancel && (
            <View
              style={{ marginTop: "12px", fontSize: "14px", color: "#666" }}
            >
              <Text>
                取消后，{selectedOrderForCancel.totalPoints} 积分将退还到账户
              </Text>
            </View>
          )}
        </View>
      </Dialog>
    </View>
  );
}

export default OrderPage;
