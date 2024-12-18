// 第一个版本（更完善的版本）
import React, { useEffect, useState } from "react";
import { AtList, AtListItem } from "taro-ui";
import { View, Image, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  // ✅ 添加了图片加载错误状态管理
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const MAX_IMAGES = 3;
  // ✅ 将API基础URL抽取为常量，便于维护
  const API_BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await Taro.request({
        url: `${API_BASE_URL}/order`,
        method: "GET",
        data: {
          user_id: 1, // 用户ID不同
        },
        // ✅ 添加了请求头设置
        header: {
          "content-type": "application/json",
        },
      });

      if (response.statusCode === 200) {
        setOrders(response.data);
      } else {
        // ✅ 添加了更好的错误处理提示
        Taro.showToast({
          title: "获取订单失败",
          icon: "none",
          duration: 2000,
        });
      }
    } catch (error) {
      // ✅ 更完善的错误处理
      console.error("API Error:", error);
      Taro.showToast({
        title: "网络请求失败",
        icon: "none",
        duration: 2000,
      });
    }
  };

  // ✅ 更健壮的图片URL处理函数
  const getImageUrl = (avatar) => {
    if (!avatar) return "";
    const cleanPath = avatar.startsWith("/") ? avatar.slice(1) : avatar;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  // ✅ 使用自定义渲染而不是AtListItem，提供更好的布局控制
  const renderListItem = (order) => {
    return (
      <View className="order-item" key={order.id}>
        <View className="order-info">
          <Text className="order-title">订单编号: {order.id}</Text>
          <Text className="order-date">
            创建日期:{" "}
            {new Date(order.time_created).toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </Text>
          <Text className="order-status">{order.status || "处理中"}</Text>
        </View>
        {/* ✅ 更好的图片展示布局 */}
        <View className="cuisine-images">
          {Array.isArray(order.cuisines) &&
            order.cuisines.slice(0, MAX_IMAGES).map((cuisine, index) => {
              if (!cuisine?.avatar) return null;
              const imageUrl = getImageUrl(cuisine.avatar);
              return (
                <Image
                  key={`${order.id}-${index}`}
                  src={imageUrl}
                  className="cuisine-image"
                  mode="aspectFill"
                  onError={(e) => {
                    console.error("Image load error:", e);
                    setImageLoadErrors((prev) => ({
                      ...prev,
                      [`${order.id}-${index}`]: true,
                    }));
                  }}
                />
              );
            })}
          {order.cuisines?.length > MAX_IMAGES && (
            <View className="more-images">
              +{order.cuisines.length - MAX_IMAGES}
            </View>
          )}
        </View>
      </View>
    );
  };

  // ✅ 添加了空状态展示
  return (
    <View className="order-list">
      {orders.map(renderListItem)}
      {orders.length === 0 && (
        <View className="empty-state">
          <Text>暂无订单数据</Text>
        </View>
      )}
    </View>
  );
}

// 第二个版本（问题较多的版本）
// export default function OrderList() {
//   // ❌ 缺少图片加载错误处理
//   // ❌ API URL 硬编码在代码中
//   // ❌ 缺少请求头设置
//   // ❌ 错误处理不够完善
//   // ❌ 使用 AtListItem 限制了布局的灵活性
//   // ❌ 图片URL处理不够健壮
//   // ❌ 缺少空状态处理
//   // ❌ 日期格式化不够详细
//   // ❌ 用户ID写死为2
//   // ❌ 图片渲染逻辑可能会因为无效的cuisine.avatar导致错误
// }
