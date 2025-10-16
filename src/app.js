import React, { useEffect } from "react";
import { useDidShow, useDidHide } from "@tarojs/taro";
import "@nutui/nutui-react-taro/dist/style.css";
// 全局样式
import "./app.scss";

function App(props) {
  return props.children;
}

export default App;
