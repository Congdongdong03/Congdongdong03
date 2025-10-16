import React, { useEffect } from "react";
import { useDidShow, useDidHide } from "@tarojs/taro";
import "@nutui/nutui-react-taro/dist/style.css";
import { ensureLogin } from "./utils/auth";
// 全局样式
import "./app.scss";

function App(props) {
  // 🆕 应用启动时自动触发微信登录
  useEffect(() => {
    const initLogin = async () => {
      try {
        console.log("🚀 应用启动，开始初始化登录...");
        const openid = await ensureLogin();
        if (openid) {
          console.log("✅ 用户登录成功，OpenID:", openid);
        } else {
          console.warn("⚠️ 用户登录失败，但不影响应用运行");
        }
      } catch (error) {
        console.error("❌ 登录初始化失败:", error);
        // 即使登录失败，也不阻止应用启动
      }
    };

    initLogin();
  }, []);

  return props.children;
}

export default App;
