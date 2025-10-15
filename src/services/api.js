import { MockDataService } from "./mockData";

// 模拟网络延迟
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// 获取分类信息接口
export const fetchCategories = async () => {
  await delay();
  return MockDataService.getCategories();
};

// 获取所有菜品
export const fetchAllDishes = async () => {
  await delay();
  return MockDataService.getAllDishes();
};

// 根据ID获取菜品
export const fetchDishById = async (dishId) => {
  await delay();
  return MockDataService.getDishById(dishId);
};

// 添加新菜品
export const addDish = async (dishData) => {
  await delay();
  return MockDataService.addDish(dishData);
};

// 检查菜品名称是否重复
export const checkDishNameExists = async (name) => {
  await delay();
  return MockDataService.checkDishNameExists(name);
};

// 获取当前用户信息
export const getCurrentUser = async () => {
  await delay();
  return MockDataService.getCurrentUser();
};

// 获取用户订单
export const fetchUserOrders = async (userOpenid) => {
  await delay();
  return MockDataService.getUserOrders(userOpenid);
};

// 创建订单
export const createOrder = async (cartItems, totalPoints) => {
  await delay();
  return MockDataService.createOrder(cartItems, totalPoints);
};

// 更新订单状态
export const updateOrderStatus = async (orderId, newStatus) => {
  await delay();
  return MockDataService.updateOrderStatus(orderId, newStatus);
};

// 获取所有订单（Chef用）
export const fetchAllOrders = async () => {
  await delay();
  return MockDataService.getAllOrders();
};

// 获取库存
export const fetchInventory = async () => {
  await delay();
  return MockDataService.getInventory();
};

// 更新库存
export const updateInventory = async (itemId, newQuantity) => {
  await delay();
  return MockDataService.updateInventory(itemId, newQuantity);
};

// 添加库存物品
export const addInventoryItem = async (name, quantity, unit) => {
  await delay();
  return MockDataService.addInventoryItem(name, quantity, unit);
};

// 获取购物清单
export const fetchShoppingList = async () => {
  await delay();
  return MockDataService.getShoppingList();
};

// 奖励积分
export const rewardPoints = async (targetUserOpenid, points) => {
  await delay();
  return MockDataService.rewardPoints(targetUserOpenid, points);
};

// 获取所有用户（Chef用）
export const fetchAllUsers = async () => {
  await delay();
  return MockDataService.getAllUsers();
};

// 模拟登录接口
export const login = async (code) => {
  await delay(1000);
  const user = MockDataService.getCurrentUser();
  return {
    code: 200,
    data: {
      token: "mock_token_" + code,
      userInfo: {
        nickName: user.nickname,
        avatarUrl: user.avatar,
        openid: user.openid,
        role: user.role,
        points: user.points,
      },
    },
    msg: "登录成功",
  };
};
