// src/constants/api.js
export const API_BASE_URL = "http://127.0.0.1:8000";

// 可以添加其他API相关的配置
export const API_TIMEOUT = 5000;
export const API_HEADERS = {
  "Content-Type": "application/json",
};

// 图片相关的配置
export const IMAGE_CONFIG = {
  MAX_RETRIES: 3,
  TIMEOUT: 10000,
  DEFAULT_MODE: "aspectFit",
};
