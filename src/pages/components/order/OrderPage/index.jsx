// 订单主页面
import React from "react";
import { View, Text } from "@tarojs/components";
import Demo1 from "../OrderList"
import "./index.scss";

const OrderPage = () => {
  return (
    <View className='order-page'>
      <View className='page-header'> 
        <Text>我的订单</Text>
      </View>

      <View>
        <Demo1 />
      </View>
    </View>
  );
}

export default OrderPage;
