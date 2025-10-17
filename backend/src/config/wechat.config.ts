// 微信小程序配置
export const WECHAT_CONFIG = {
  // 小程序 AppID
  appId: "wxfd972ebc3f581169",

  // 小程序 AppSecret（请妥善保管，不要泄露）
  appSecret: "aed4d3c82370e747b99db8e0ce03c8be",

  // 订阅消息模板ID
  templateIds: {
    orderSuccess: "uAhvMsr0N9n9bjCu64gxX0oZTAsjgUIxnxsSvgVN16s", // 点餐成功通知
  },

  // 商家（管理员）OpenID - 需要通过临时接口获取后填入
  // 获取方式：启动后端后访问 http://localhost:3001/api/wechat/get-openid?code=YOUR_CODE
  adminOpenId: "o9k7x60psm724DLlAw97yYpxskh8", // 正确的 OpenID

  // 微信 API 地址
  apiBaseUrl: "https://api.weixin.qq.com",
};
