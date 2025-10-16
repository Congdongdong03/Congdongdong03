import Taro from "@tarojs/taro";
import { ensureLogin, getOpenId } from "../utils/auth";

// 后端API基础URL
const BASE_URL = "http://localhost:3001/api";

// 通用请求函数
const request = async (url, options = {}) => {
  try {
    const response = await Taro.request({
      url: `${BASE_URL}${url}`,
      method: options.method || "GET",
      data: options.data,
      header: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data;
    } else {
      // 创建包含完整错误信息的Error对象
      const error = new Error(response.data?.error || "请求失败");
      error.statusCode = response.statusCode;
      error.data = response.data;
      throw error;
    }
  } catch (error) {
    console.error("API请求失败:", error);
    // 如果是Taro.request抛出的错误，添加errMsg信息
    if (error.errMsg && !error.data) {
      const enhancedError = new Error(error.errMsg);
      enhancedError.errMsg = error.errMsg;
      enhancedError.errno = error.errno;
      throw enhancedError;
    }
    throw error;
  }
};

// 获取分类
export const fetchCategories = async () => {
  return request("/categories");
};

// 获取分类和菜品
export const fetchCategoriesWithDishes = async () => {
  const [categories, dishes] = await Promise.all([
    request("/categories"),
    request("/dishes"),
  ]);

  // 根据分类组织菜品
  const categoriesWithDishes = [
    { id: "all", name: "全部", dishes },
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      dishes: dishes.filter((dish) => dish.categoryId === category.id),
    })),
  ];

  return categoriesWithDishes;
};

// 获取所有菜品
export const fetchAllDishes = async () => {
  return request("/dishes");
};

// 根据ID获取菜品
export const fetchDishById = async (dishId) => {
  const dishes = await request("/dishes");
  return dishes.find((dish) => dish.id === dishId);
};

// 添加新菜品
export const addDish = async (dishData) => {
  return request("/dishes", {
    method: "POST",
    data: dishData,
  });
};

// 分类管理API
export const addCategory = async (categoryData) => {
  return request("/categories", {
    method: "POST",
    data: categoryData,
  });
};

export const updateCategory = async (categoryId, categoryData) => {
  return request(`/categories/${categoryId}`, {
    method: "PUT",
    data: categoryData,
  });
};

export const deleteCategory = async (categoryId) => {
  return request(`/categories/${categoryId}`, {
    method: "DELETE",
  });
};

// 更新菜品
export const updateDish = async (dishId, dishData) => {
  return request(`/dishes/${dishId}`, {
    method: "PUT",
    data: dishData,
  });
};

// 删除菜品
export const deleteDish = async (dishId) => {
  return request(`/dishes/${dishId}`, {
    method: "DELETE",
  });
};

// 检查菜品名称是否重复
export const checkDishNameExists = async (name) => {
  const dishes = await request("/dishes");
  return dishes.some((dish) => dish.name === name);
};

// 获取当前用户信息
export const getCurrentUser = async () => {
  // 🆕 使用真实的微信登录流程
  const openid = await ensureLogin();

  if (!openid) {
    throw new Error("登录失败，无法获取用户信息");
  }

  // 使用真实的 openid 获取用户信息
  return request(`/users/${openid}`);
};

// 获取用户订单 - 接受userId或openid
export const fetchUserOrders = async (userIdOrOpenid) => {
  // 如果传入的是数字ID，直接使用；否则先获取用户信息
  if (typeof userIdOrOpenid === "number") {
    return request(`/orders/${userIdOrOpenid}`);
  } else {
    // openid格式，需要先获取用户信息
    const user = await request(`/users/${userIdOrOpenid}`);
    return request(`/orders/${user.id}`);
  }
};

// 创建订单
export const createOrder = async (cartItems, totalPoints, remark = "") => {
  // 获取当前用户
  const user = await getCurrentUser();

  const orderData = {
    userId: user.id,
    items: cartItems,
    totalPoints,
    remark, // 添加备注字段
  };

  return request("/orders", {
    method: "POST",
    data: orderData,
  });
};

// 更新订单状态
export const updateOrderStatus = async (orderId, newStatus) => {
  return request(`/orders/${orderId}/status`, {
    method: "PUT",
    data: { status: newStatus },
  });
};

// 获取所有订单（Chef用）
export const fetchAllOrders = async () => {
  return request("/orders/all");
};

// 获取库存
export const fetchInventory = async () => {
  return request("/inventory");
};

// 更新库存
export const updateInventory = async (itemId, newQuantity) => {
  return request(`/inventory/${itemId}`, {
    method: "PUT",
    data: { quantity: newQuantity },
  });
};

// 添加库存物品
export const addInventoryItem = async (name, quantity, unit) => {
  return request("/inventory", {
    method: "POST",
    data: { name, quantity, unit },
  });
};

// 删除库存物品
export const deleteInventoryItem = async (itemId) => {
  return request(`/inventory/${itemId}`, {
    method: "DELETE",
  });
};

// 获取购物清单（基于最近订单和原材料库存）
export const fetchShoppingList = async () => {
  return request("/shopping-list");
};

// 奖励积分
export const rewardPoints = async (targetUserOpenid, points, description) => {
  // 先获取目标用户信息
  const user = await request(`/users/${targetUserOpenid}`);

  return request("/points/reward", {
    method: "POST",
    data: {
      userId: user.id,
      amount: points,
      description: description || `管理员奖励 ${points} 积分`,
    },
  });
};

// 扣减积分
export const deductPoints = async (targetUserOpenid, points, description) => {
  // 先获取目标用户信息
  const user = await request(`/users/${targetUserOpenid}`);

  return request("/points/deduct", {
    method: "POST",
    data: {
      userId: user.id,
      amount: points,
      description: description || `管理员扣减 ${points} 积分`,
    },
  });
};

// 更新用户信息
export const updateUserInfo = async (openid, nickname, avatar) => {
  return request(`/users/${openid}`, {
    method: "PUT",
    data: {
      nickname,
      avatar,
    },
  });
};

// 获取积分历史
export const getPointsHistory = async () => {
  const user = await getCurrentUser();
  return request(`/points/history/${user.id}`);
};

// 获取所有用户（Chef用）
export const fetchAllUsers = async () => {
  // 🆕 调用真实的后端接口获取所有用户
  return request("/users");
};

// 模拟登录接口
export const login = async (code) => {
  // 使用固定的测试用户
  const user = await getCurrentUser();

  return {
    code: 200,
    data: {
      token: "real_token_" + code,
      userInfo: {
        nickName: user.nickname,
        avatarUrl: user.avatar || "",
        openid: user.openid,
        role: user.role,
        points: user.points,
      },
    },
    msg: "登录成功",
  };
};

// 取消订单
export const cancelOrder = async (orderId) => {
  return request(`/orders/${orderId}`, {
    method: "DELETE",
  });
};

// 获取温馨提示
export const getNoticeText = async () => {
  return request("/settings/notice");
};

// 更新温馨提示
export const updateNoticeText = async (noticeText, userId = null) => {
  // 如果没有传入userId，则获取当前用户（向后兼容）
  if (!userId) {
    const user = await getCurrentUser();
    userId = user.id;
  }

  return request("/settings/notice", {
    method: "PUT",
    data: {
      noticeText,
      userId,
    },
  });
};

// 菜品原材料相关API
// 获取菜品的原材料列表
export const fetchDishMaterials = async (dishId) => {
  return request(`/dishes/${dishId}/materials`);
};

// 添加菜品原材料
export const addDishMaterial = async (dishId, itemId, amount) => {
  return request(`/dishes/${dishId}/materials`, {
    method: "POST",
    data: { itemId, amount },
  });
};

// 删除菜品原材料
export const deleteDishMaterial = async (dishId, materialId) => {
  return request(`/dishes/${dishId}/materials/${materialId}`, {
    method: "DELETE",
  });
};

// 获取所有原材料（用于选择）
export const fetchAllInventory = async () => {
  return request("/inventory/all");
};
