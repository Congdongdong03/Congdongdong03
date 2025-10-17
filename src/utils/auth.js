import Taro from "@tarojs/taro";

// 存储键
const STORAGE_KEYS = {
  USER_OPENID: "user_openid",
  USER_SESSION_KEY: "user_session_key",
};

/**
 * 获取用户 OpenID（从本地缓存）
 * @returns {string|null} OpenID 或 null
 */
export const getOpenId = () => {
  try {
    const openid = Taro.getStorageSync(STORAGE_KEYS.USER_OPENID);
    return openid || null;
  } catch (error) {
    console.error("获取 OpenID 失败:", error);
    return null;
  }
};

/**
 * 保存用户 OpenID 到本地缓存
 * @param {string} openid
 * @param {string} sessionKey
 */
export const saveOpenId = (openid, sessionKey) => {
  try {
    Taro.setStorageSync(STORAGE_KEYS.USER_OPENID, openid);
    if (sessionKey) {
      Taro.setStorageSync(STORAGE_KEYS.USER_SESSION_KEY, sessionKey);
    }
    console.log("✅ OpenID 已保存到本地缓存");
    return true;
  } catch (error) {
    console.error("保存 OpenID 失败:", error);
    return false;
  }
};

/**
 * 清除用户登录信息
 */
export const clearAuth = () => {
  try {
    Taro.removeStorageSync(STORAGE_KEYS.USER_OPENID);
    Taro.removeStorageSync(STORAGE_KEYS.USER_SESSION_KEY);
    console.log("✅ 用户登录信息已清除");
    return true;
  } catch (error) {
    console.error("清除登录信息失败:", error);
    return false;
  }
};

/**
 * 检查是否已登录（是否有 OpenID）
 * @returns {boolean}
 */
export const isLoggedIn = () => {
  const openid = getOpenId();
  return !!openid;
};

/**
 * 微信登录流程
 * 1. 调用 wx.login() 获取 code
 * 2. 将 code 发送到后端，换取 openid
 * 3. 保存 openid 到本地缓存
 * @returns {Promise<{success: boolean, openid?: string, error?: string}>}
 */
export const wxLogin = async () => {
  try {
    console.log("🔐 开始微信登录流程...");

    // 步骤1：调用 wx.login() 获取临时登录凭证 code
    const loginRes = await Taro.login();

    if (!loginRes.code) {
      throw new Error("获取登录凭证失败");
    }

    console.log("✅ 获取到登录凭证 code:", loginRes.code);

    // 步骤2：将 code 发送到后端，换取 openid
    // 注意：在真实环境中，后端会调用微信API，用 code 换取 openid 和 session_key
    const response = await Taro.request({
      url: "https://congdongdong03.onrender.com/api/wechat/get-openid",
      method: "GET",
      data: {
        code: loginRes.code,
      },
    });

    console.log("🔑 后端响应:", response.data);

    if (response.statusCode === 200 && response.data.openid) {
      const { openid } = response.data;

      // 步骤3：保存 openid 到本地缓存
      saveOpenId(openid);

      console.log("✅ 微信登录成功！OpenID:", openid);

      return {
        success: true,
        openid,
      };
    } else {
      throw new Error(response.data?.error || "登录失败");
    }
  } catch (error) {
    console.error("❌ 微信登录失败:", error);
    return {
      success: false,
      error: error.errMsg || error.message || "登录失败，请重试",
    };
  }
};

/**
 * 确保用户已登录
 * 如果未登录，则自动触发登录流程
 * @returns {Promise<string|null>} OpenID 或 null
 */
export const ensureLogin = async () => {
  // 检查本地是否已有 OpenID
  let openid = getOpenId();

  if (openid) {
    console.log("✅ 用户已登录，OpenID:", openid);
    return openid;
  }

  // 如果没有，则触发登录流程
  console.log("⚠️ 用户未登录，开始自动登录...");
  const loginResult = await wxLogin();

  if (loginResult.success) {
    return loginResult.openid;
  } else {
    console.error("❌ 自动登录失败:", loginResult.error);
    return null;
  }
};
