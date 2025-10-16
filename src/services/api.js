// 选择使用真实API还是模拟数据
import * as RealApi from "./realApi";

// 获取分类信息接口
export const fetchCategories = async () => {
  return RealApi.fetchCategories();
};

// 获取分类和菜品
export const fetchCategoriesWithDishes = async () => {
  return RealApi.fetchCategoriesWithDishes();
};

// 分类管理API
export const addCategory = async (categoryData) => {
  return RealApi.addCategory(categoryData);
};

export const updateCategory = async (categoryId, categoryData) => {
  return RealApi.updateCategory(categoryId, categoryData);
};

export const deleteCategory = async (categoryId) => {
  return RealApi.deleteCategory(categoryId);
};

// 获取所有菜品
export const fetchAllDishes = async () => {
  return RealApi.fetchAllDishes();
};

// 根据ID获取菜品
export const fetchDishById = async (dishId) => {
  return RealApi.fetchDishById(dishId);
};

// 添加新菜品
export const addDish = async (dishData) => {
  return RealApi.addDish(dishData);
};

// 更新菜品
export const updateDish = async (dishId, dishData) => {
  return RealApi.updateDish(dishId, dishData);
};

// 删除菜品
export const deleteDish = async (dishId) => {
  return RealApi.deleteDish(dishId);
};

// 检查菜品名称是否重复
export const checkDishNameExists = async (name) => {
  return RealApi.checkDishNameExists(name);
};

// 获取当前用户信息
export const getCurrentUser = async () => {
  return RealApi.getCurrentUser();
};

// 获取用户订单
export const fetchUserOrders = async (userOpenid) => {
  return RealApi.fetchUserOrders(userOpenid);
};

// 创建订单
export const createOrder = async (cartItems, totalPoints, remark = "") => {
  return RealApi.createOrder(cartItems, totalPoints, remark);
};

// 更新订单状态
export const updateOrderStatus = async (orderId, newStatus) => {
  return RealApi.updateOrderStatus(orderId, newStatus);
};

// 获取所有订单（Chef用）
export const fetchAllOrders = async () => {
  return RealApi.fetchAllOrders();
};

// 获取库存
export const fetchInventory = async () => {
  return RealApi.fetchInventory();
};

// 更新库存
export const updateInventory = async (itemId, newQuantity) => {
  return RealApi.updateInventory(itemId, newQuantity);
};

// 添加库存物品
export const addInventoryItem = async (name, quantity, unit) => {
  return RealApi.addInventoryItem(name, quantity, unit);
};

// 删除库存物品
export const deleteInventoryItem = async (itemId) => {
  return RealApi.deleteInventoryItem(itemId);
};

// 获取购物清单
export const fetchShoppingList = async () => {
  return RealApi.fetchShoppingList();
};

// 奖励积分
export const rewardPoints = async (targetUserOpenid, points) => {
  return RealApi.rewardPoints(targetUserOpenid, points);
};

// 获取积分历史
export const getPointsHistory = async () => {
  return RealApi.getPointsHistory();
};

// 获取所有用户（Chef用）
export const fetchAllUsers = async () => {
  return RealApi.fetchAllUsers();
};

// 模拟登录接口
export const login = async (code) => {
  return RealApi.login(code);
};

// 取消订单
export const cancelOrder = async (orderId) => {
  return RealApi.cancelOrder(orderId);
};

// 获取温馨提示
export const getNoticeText = async () => {
  return RealApi.getNoticeText();
};

// 更新温馨提示
export const updateNoticeText = async (noticeText) => {
  return RealApi.updateNoticeText(noticeText);
};
