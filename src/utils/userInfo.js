import Taro from "@tarojs/taro";

// 默认用户信息
const DEFAULT_USER_INFO = {
  nickname: "亲爱的",
  avatar: "/src/pages/picture/user_picture.jpg", // 粉色狐狸头像
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
 * 请求用户授权获取微信用户信息
 * 注意：wx.getUserProfile 需要用户主动触发（例如点击按钮）
 */
export const requestUserAuthorization = async () => {
  try {
    // 使用 getUserProfile 替代已废弃的 getUserInfo
    const res = await Taro.getUserProfile({
      desc: "用于完善会员资料", // 必填，说明获取用户信息的用途
    });

    if (res.userInfo) {
      const { nickName, avatarUrl } = res.userInfo;

      // 保存到本地缓存
      saveUserInfo(nickName, avatarUrl);

      return {
        success: true,
        nickname: nickName,
        avatar: avatarUrl,
      };
    }

    throw new Error("获取用户信息失败");
  } catch (error) {
    console.error("请求用户授权失败:", error);
    return {
      success: false,
      error: error.errMsg || error.message,
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
