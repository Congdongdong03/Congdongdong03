import React, { useEffect, useState } from "react";
import { AtList, AtListItem } from "taro-ui";
import { View, Image, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const MAX_IMAGES = 3; // 限制显示图片数量

  // 数据加载函数
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await Taro.request({
        url: "http://127.0.0.1:8000/order", // 替换为你的接口地址
        method: "GET",
        data: {
          user_id: 2
        }
      });
      if (response.statusCode === 200) {
        setOrders(response.data); // 设置订单数据
      } else {
        console.error("获取订单数据失败:", response.errMsg);
      }
    } catch (error) {
      console.error("请求失败:", error);
    }
  };

  const renderImages = (cuisines) => {
    if (!cuisines || cuisines.length === 0) {
      return <Text className="no-images-text">暂无图片</Text>;
    }
  
    const limitedImages = cuisines.slice(0, MAX_IMAGES); // 限制图片数量
    return (
      <View className="image-container">
        {limitedImages.map((cuisine, index) => {
          console.log('cuisine.avatar:', cuisine.avatar); // 打印出 avatar 来检查是否是有效的图片路径
          const imageUrl = decodeURIComponent("http://127.0.0.1:8000" + cuisine.avatar); // 解码 URL
          console.log('Decoded imageUrl:', imageUrl); // 打印解码后的路径
          return (  // 这里加上了 return，确保渲染 Image 组件
            <Image
              key={index}
              src={imageUrl} // 使用 `avatar` 字段
              alt="图片加载失败"
              className="image-thumbnail"
              mode="aspectFill"
            />
          );
        })}
        {cuisines.length > MAX_IMAGES && (
          <View className="image-more">+{cuisines.length - MAX_IMAGES}</View>
        )}
      </View>
    );
  };
  

  return (
    <AtList>
      {orders.map((order) => (
        <AtListItem
          key={order.id}
          title={`订单编号: ${order.id}`}
          note={`创建日期: ${new Date(order.time_created).toLocaleString()}`} // 格式化日期
          thumb={renderImages(order.cuisines)} // 渲染菜品缩略图
        />
      ))}
    </AtList>
  );
}
