export default defineAppConfig({
  pages: [
    "pages/order/index", // 订单页面
    "pages/Menu/MenuPage/index", // 菜单页面
    "pages/profile/index", // 我的页面
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "减肥食谱",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    color: "#999999",
    selectedColor: "#333333",
    backgroundColor: "#ffffff",
    list: [
      {
        pagePath: "pages/Menu/MenuPage/index",
        text: "减肥食谱",
        iconPath: "assets/icons/my-nofood.png", // 未选中时的图标
        selectedIconPath: "assets/icons/my-food.png", // 选中时的图标
      },
      {
        pagePath: "pages/order/index",
        iconPath: "assets/icons/my-noorder.png",
        selectedIconPath: "assets/icons/my-order.png",
        text: "训练记录",
      },
      {
        pagePath: "pages/profile/index",
        text: "干饭冠军",
        iconPath: "assets/icons/my.png",
        selectedIconPath: "assets/icons/select-my.png",
      },
    ],
  },
});
