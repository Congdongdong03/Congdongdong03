import Taro from "@tarojs/taro";
import { ensureLogin, getOpenId } from "../utils/auth";
import { ENV_CONFIG } from "../config/environment";

// 使用环境配置的API基础URL
const BASE_URL = ENV_CONFIG.apiBaseUrl;

// 通用请求函数
const request = async (url, options = {}) => {
  let finalUrl = `${BASE_URL}${url}`; // 🔧 移到外层，避免作用域问题
  try {
    // 处理查询参数
    if (options.params) {
      const queryString = Object.keys(options.params)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(
              options.params[key]
            )}`
        )
        .join("&");
      finalUrl += `?${queryString}`;
    }

    const response = await Taro.request({
      url: finalUrl,
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
    console.error("请求URL:", finalUrl);
    console.error("错误详情:", {
      errMsg: error.errMsg,
      errno: error.errno,
      statusCode: error.statusCode,
    });

    // 特殊处理连接被拒绝的错误
    if (error.errMsg && error.errMsg.includes("ERR_CONNECTION_REFUSED")) {
      const connectionError = new Error(
        "网络连接失败，请检查网络设置或联系管理员"
      );
      connectionError.errMsg = error.errMsg;
      connectionError.errno = error.errno;
      connectionError.type = "CONNECTION_REFUSED";
      throw connectionError;
    }

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
  const loginResult = await ensureLogin();

  if (!loginResult || !loginResult.openid) {
    throw new Error("登录失败，无法获取用户信息");
  }

  // 🎯 关键优化：如果登录时已经返回了用户信息（新用户注册），直接使用
  if (loginResult.user) {
    console.log(
      "✅ 使用登录返回的用户信息（新用户或刚登录）:",
      loginResult.user
    );
    return loginResult.user;
  }

  // 老用户：需要从后端查询最新的用户信息
  console.log("🔄 查询用户信息，OpenID:", loginResult.openid);
  const user = await request(`/users/${loginResult.openid}`);
  console.log("🔍 getCurrentUser 返回的用户对象:", user);
  return user;
};

// 获取用户订单 - 接受userId
export const fetchUserOrders = async (userId) => {
  // 直接使用userId获取订单列表
  return request(`/orders/${userId}`);
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

// 更新订单状态（需要大厨权限）
export const updateOrderStatus = async (orderId, newStatus) => {
  // 🆕 获取当前用户ID用于权限验证
  const user = await getCurrentUser();
  return request(`/orders/${orderId}/status`, {
    method: "PUT",
    data: { status: newStatus, userId: user.id },
  });
};

// 获取所有订单（Chef用，需要大厨权限）
export const fetchAllOrders = async () => {
  // 🆕 获取当前用户ID用于权限验证
  const user = await getCurrentUser();
  return request(`/orders/all?operatorUserId=${user.id}`);
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

// 奖励积分（需要大厨权限）
export const rewardPoints = async (targetUserOpenid, points, description) => {
  // 🆕 获取当前用户（操作者）和目标用户信息
  const [currentUser, targetUser] = await Promise.all([
    getCurrentUser(),
    request(`/users/${targetUserOpenid}`),
  ]);

  return request("/points/reward", {
    method: "POST",
    data: {
      userId: targetUser.id,
      amount: points,
      description: description || `管理员奖励 ${points} 积分`,
      operatorUserId: currentUser.id, // 操作者ID用于权限验证
    },
  });
};

// 扣减积分（需要大厨权限）
export const deductPoints = async (targetUserOpenid, points, description) => {
  // 🆕 获取当前用户（操作者）和目标用户信息
  const [currentUser, targetUser] = await Promise.all([
    getCurrentUser(),
    request(`/users/${targetUserOpenid}`),
  ]);

  return request("/points/deduct", {
    method: "POST",
    data: {
      userId: targetUser.id,
      amount: points,
      description: description || `管理员扣减 ${points} 积分`,
      operatorUserId: currentUser.id, // 操作者ID用于权限验证
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

// 获取所有用户（Chef用，需要大厨权限）
export const fetchAllUsers = async () => {
  // 🆕 获取当前用户ID用于权限验证
  const user = await getCurrentUser();
  return request(`/users?operatorUserId=${user.id}`);
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
export const updateNoticeText = async (noticeText, userId) => {
  // 🆕 必须传入userId以确保权限验证
  if (!userId) {
    throw new Error("更新温馨提示需要用户ID");
  }

  console.log("🔍 updateNoticeText 调用参数:", { noticeText, userId });

  return request("/settings/notice", {
    method: "PUT",
    data: {
      noticeText,
    },
    params: {
      operatorUserId: userId, // 添加操作者用户ID用于权限验证
    },
  });
};

// 🆕 图片上传API
/**
 * 上传图片到服务器
 * @param {string} filePath - 本地文件路径
 * @returns {Promise<{url: string, filename: string}>}
 */
export const uploadImage = async (filePath) => {
  return new Promise((resolve, reject) => {
    Taro.uploadFile({
      url: ENV_CONFIG.imageUploadUrl,
      filePath: filePath,
      name: "image",
      header: {
        "Content-Type": "multipart/form-data",
      },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data);
            if (data.success) {
              // 返回完整的图片URL，避免重复拼接
              const fullUrl = data.data.url.startsWith("http")
                ? data.data.url
                : `${ENV_CONFIG.imageBaseUrl}${data.data.url}`;
              resolve({
                url: fullUrl,
                filename: data.data.filename,
              });
            } else {
              reject(new Error(data.error || "上传失败"));
            }
          } catch (error) {
            reject(new Error("解析响应失败"));
          }
        } else {
          reject(new Error(`上传失败，状态码: ${res.statusCode}`));
        }
      },
      fail: (error) => {
        console.error("图片上传失败:", error);
        reject(new Error(error.errMsg || "图片上传失败"));
      },
    });
  });
};
