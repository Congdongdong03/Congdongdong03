import axios from "axios";
import { WECHAT_CONFIG } from "../config/wechat.config";

/**
 * 通过微信code获取OpenID和SessionKey
 */
export const getOpenIdByCode = async (code: string) => {
  try {
    const { appId, appSecret, apiBaseUrl } = WECHAT_CONFIG;

    // 调用微信API换取openid
    const url = `${apiBaseUrl}/sns/jscode2session`;
    const response = await axios.get(url, {
      params: {
        appid: appId,
        secret: appSecret,
        js_code: code,
        grant_type: "authorization_code",
      },
    });

    const { openid, session_key, errcode, errmsg } = response.data;

    // 检查错误
    if (errcode) {
      throw new Error(`微信API错误: ${errcode} - ${errmsg}`);
    }

    if (!openid) {
      throw new Error("未能获取到OpenID");
    }

    return {
      openid,
      session_key,
    };
  } catch (error: any) {
    console.error("获取OpenID失败:", error);
    throw new Error(error.message || "获取OpenID失败");
  }
};
