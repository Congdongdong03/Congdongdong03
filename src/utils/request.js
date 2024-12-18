import Taro from "@tarojs/taro";
import { API_BASE_URL, API_TIMEOUT, API_HEADERS } from "../constants/api";

// 封装请求方法
const request = (url, method = "GET", data = {}, headers = {}) => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${API_BASE_URL}${url}`, // 基础URL拼接路径
      method,
      data,
      header: { ...API_HEADERS, ...headers }, // 合并默认头部和传入头部
      timeout: API_TIMEOUT,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data); // 成功返回数据
        } else {
          reject(`错误代码: ${res.statusCode}, 信息: ${res.data}`);
        }
      },
      fail: (err) => {
        reject(`请求失败: ${err.errMsg}`);
      },
    });
  });
};

export default request;
