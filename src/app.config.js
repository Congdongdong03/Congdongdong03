export default {
  pages: [
    "pages/Menu/MenuPage/index", // 菜单页面（一进小程序必需）
    "pages/inventory/index", // 库存管理页面（冰箱）- tabBar页面
    "pages/order/index", // 订单页面（训练记录）- tabBar页面
    "pages/profile/index", // 我的页面（干饭冠军）- tabBar页面
  ],
  subpackages: [
    {
      root: "subpackages/user",
      name: "user",
      pages: [
        "login/index", // 登录页面
        "points/index", // 积分中心页面
      ],
    },
    {
      root: "subpackages/admin",
      name: "admin",
      pages: [
        "admin/index", // 管理页面
        "category-management/index", // 分类管理页面
        "add-dish/index", // 添加菜品页面
        "shopping-list/index", // 购物清单页面
      ],
    },
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#f9dde6", // 晨曦粉背景
    navigationBarTitleText: "贝儿大食堂",
    navigationBarTextStyle: "black", // 黑色文字
  },
  tabBar: {
    color: "#888888", // 次文本色
    selectedColor: "#f9dde6", // 晨曦粉
    backgroundColor: "#ffffff", // 纯白背景
    list: [
      {
        pagePath: "pages/Menu/MenuPage/index",
        text: "菜单",
        iconPath: "assets/icons/my-nofood.png", // 未选中时的图标
        selectedIconPath: "assets/icons/my-food.png", // 选中时的图标
      },
      {
        pagePath: "pages/inventory/index",
        text: "冰箱",
        iconPath: "assets/icons/my-noorder.png",
        selectedIconPath: "assets/icons/my-order.png",
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
};
