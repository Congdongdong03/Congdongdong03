export default defineAppConfig({
  pages: [
    "pages/Menu/MenuPage/index", // 菜单页面
    "pages/order/index", // 订单页面
    "pages/profile/index", // 我的页面
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "菜单",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    color: "#999999",
    selectedColor: "#333333",
    backgroundColor: "#ffffff",
    list: [
      {
        pagePath: "pages/Menu/MenuPage/index",
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
