export default defineAppConfig({
  pages: [
    "pages/manu/MenuPage/index", // 菜单页面
    "pages/order/index", // 订单页面
    "pages/profile/index", // 我的页面
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    color: "#999999",
    selectedColor: "#333333",
    backgroundColor: "#ffffff",
    list: [
      {
        pagePath: "pages/manu/MenuPage/index",
        text: "菜单",
      },
      {
        pagePath: "pages/order/index",
        text: "订单",
      },
      {
        pagePath: "pages/profile/index",
        text: "我的",
      },
    ],
  },
});
