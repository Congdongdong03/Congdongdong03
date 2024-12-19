import React from "react";
import { View, Text } from "@tarojs/components";
import OrderList from "./OrderList";
import "./index.scss";

function OrderPage() {
  return (
    <View>
      <h1 className="title">我的订单</h1>
      <OrderList />
    </View>
  );
}

export default OrderPage;
