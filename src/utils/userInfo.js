import Taro from "@tarojs/taro";
import { updateUserInfo } from "../services/api";

// 默认用户信息
const DEFAULT_USER_INFO = {
  nickname: "微信用户",
  avatar: "",
};

// 存储键
const STORAGE_KEYS = {
  NICKNAME: "user_nickname",
  AVATAR: "user_avatar",
  HAS_AUTHORIZED: "user_has_authorized",
};

/**
 * 获取用户信息（优先从本地缓存获取，如果没有则返回默认值）
 */
export const getUserInfo = () => {
  try {
    const hasAuthorized = Taro.getStorageSync(STORAGE_KEYS.HAS_AUTHORIZED);

    if (hasAuthorized) {
      const nickname = Taro.getStorageSync(STORAGE_KEYS.NICKNAME);
      const avatar = Taro.getStorageSync(STORAGE_KEYS.AVATAR);

      return {
        nickname: nickname || DEFAULT_USER_INFO.nickname,
        avatar: avatar || DEFAULT_USER_INFO.avatar,
        hasAuthorized: true,
      };
    }

    return {
      ...DEFAULT_USER_INFO,
      hasAuthorized: false,
    };
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return {
      ...DEFAULT_USER_INFO,
      hasAuthorized: false,
    };
  }
};

/**
 * 保存用户信息到本地缓存
 */
export const saveUserInfo = (nickname, avatar) => {
  try {
    Taro.setStorageSync(STORAGE_KEYS.NICKNAME, nickname);
    Taro.setStorageSync(STORAGE_KEYS.AVATAR, avatar);
    Taro.setStorageSync(STORAGE_KEYS.HAS_AUTHORIZED, true);
    return true;
  } catch (error) {
    console.error("保存用户信息失败:", error);
    return false;
  }
};

/**
 * 同步用户信息到后端数据库
 * @param {string} nickname - 昵称
 * @param {string} avatar - 头像URL
 */
export const syncUserInfoToBackend = async (nickname, avatar) => {
  try {
    // 动态导入避免循环依赖
    const { getOpenId } = await import("./auth");
    const { updateUserInfo } = await import("../services/realApi");

    const openid = getOpenId();
    if (!openid) {
      throw new Error("未找到用户OpenID，无法同步");
    }

    console.log("🔄 正在同步用户信息到后端...", { openid, nickname, avatar });

    // 调用后端API更新用户信息
    await updateUserInfo(openid, nickname, avatar);

    console.log("✅ 用户信息已同步到后端数据库");
    return true;
  } catch (error) {
    console.error("❌ 同步用户信息到后端失败:", error);
    throw error;
  }
};

/**
 * 保存用户信息（同时保存到本地和后端）
 * @param {string} nickname - 昵称
 * @param {string} avatar - 头像URL
 */
export const saveAndSyncUserInfo = async (nickname, avatar) => {
  try {
    // 1. 保存到本地缓存
    saveUserInfo(nickname, avatar);
    console.log("✅ 用户信息已保存到本地缓存");

    // 2. 同步到后端数据库
    await syncUserInfoToBackend(nickname, avatar);

    return { success: true };
  } catch (error) {
    console.error("保存用户信息失败:", error);
    return {
      success: false,
      error: error.message || "保存失败",
    };
  }
};

/**
 * 清除用户信息缓存
 */
export const clearUserInfo = () => {
  try {
    Taro.removeStorageSync(STORAGE_KEYS.NICKNAME);
    Taro.removeStorageSync(STORAGE_KEYS.AVATAR);
    Taro.removeStorageSync(STORAGE_KEYS.HAS_AUTHORIZED);
    return true;
  } catch (error) {
    console.error("清除用户信息失败:", error);
    return false;
  }
};
