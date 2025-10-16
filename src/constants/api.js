// src/constants/api.js
export const API_BASE_URL = "http://127.0.0.1:8000";

// 可以添加其他API相关的配置
export const API_TIMEOUT = 5000;
export const API_HEADERS = {
  "Content-Type": "application/json",
};

// 微信订阅消息配置
export const WECHAT_CONFIG = {
  // 订单通知订阅消息模板ID
  // 注意：如果需要更换模板ID，请在此处修改
  SUBSCRIBE_MESSAGE_TEMPLATE_IDS: [
    "uAhvMsr0N9n9bjCu64gxX0oZTAsjgUIxnxsSvgVN16s", // 订单状态通知模板
  ],
};
