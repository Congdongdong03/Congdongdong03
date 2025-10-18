import Taro from "@tarojs/taro";
import { ENV_CONFIG } from "../config/environment";

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
 * 2. 将 code 发送到后端，换取 openid 和用户信息
 * 3. 保存 openid 和用户信息到本地缓存
 * @returns {Promise<{success: boolean, openid?: string, user?: object, error?: string}>}
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
    // 🔧 修复：使用环境配置中的API地址，而不是硬编码生产环境地址
    const response = await Taro.request({
      url: `${ENV_CONFIG.apiBaseUrl}/wechat/get-openid`,
      method: "GET",
      data: {
        code: loginRes.code,
      },
    });

    console.log("🔑 后端响应:", response.data);

    // 🔧 适配新的响应格式：{ success: true, data: { openid, session_key, user, isNewUser } }
    if (response.statusCode === 200) {
      let openid;
      let userData;
      let isNewUser = false;

      // 兼容新旧两种响应格式
      if (response.data.success && response.data.data) {
        // 新格式
        openid = response.data.data.openid;
        userData = response.data.data.user;
        isNewUser = response.data.data.isNewUser || false;
      } else if (response.data.openid) {
        // 旧格式（向后兼容）
        openid = response.data.openid;
        userData = response.data.user;
      }

      if (openid) {
        // 步骤3：保存 openid 到本地缓存
        saveOpenId(openid);

        // 🎯 前端控制台标注：新用户 vs 老用户
        if (isNewUser) {
          console.log("═══════════════════════════════════════");
          console.log("🆕 新用户注册成功！");
          console.log("═══════════════════════════════════════");
          console.log(`📱 OpenID: ${openid}`);
          console.log(`👤 昵称: ${userData?.nickname || "微信用户"}`);
          console.log(`💰 初始积分: ${userData?.points || 0}`);
          console.log(`🎉 欢迎新用户加入！`);
          console.log("═══════════════════════════════════════");
        } else {
          console.log("═══════════════════════════════════════");
          console.log("🔄 老用户登录成功！");
          console.log("═══════════════════════════════════════");
          console.log(`📱 OpenID: ${openid}`);
          console.log(`👤 昵称: ${userData?.nickname || "微信用户"}`);
          console.log(`💰 当前积分: ${userData?.points || 0}`);
          console.log(
            `🏷️ 角色: ${userData?.role === "chef" ? "👨‍🍳 大厨" : "🍽️ 食客"}`
          );
          console.log("═══════════════════════════════════════");
        }

        return {
          success: true,
          openid,
          user: userData, // 🆕 返回完整的用户信息
        };
      }
    }

    throw new Error(response.data?.error || "登录失败");
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
 * @returns {Promise<{openid: string, user?: object}|null>} 返回 openid 和用户信息，或 null
 */
export const ensureLogin = async () => {
  // 检查本地是否已有 OpenID
  let openid = getOpenId();

  // 🧪 测试模式：强制触发新登录（测试完记得注释掉）
  const FORCE_NEW_LOGIN = false; // ⚠️ 测试完成，恢复正常行为

  if (openid && !FORCE_NEW_LOGIN) {
    console.log("✅ 用户已登录，OpenID:", openid);
    return { openid, user: null }; // 老用户，没有缓存的 user 信息
  }

  // 如果没有，则触发登录流程
  console.log("⚠️ 用户未登录，开始自动登录...");
  const loginResult = await wxLogin();

  if (loginResult.success) {
    return {
      openid: loginResult.openid,
      user: loginResult.user, // 🆕 返回刚登录获取的用户信息
    };
  } else {
    console.error("❌ 自动登录失败:", loginResult.error);
    return null;
  }
};
