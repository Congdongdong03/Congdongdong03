import axios from "axios";
import { WECHAT_CONFIG } from "../config/wechat.config";

/**
 * 获取小程序的 access_token
 * 文档: https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-access-token/getAccessToken.html
 */
async function getAccessToken(): Promise<string> {
  const { appId, appSecret, apiBaseUrl } = WECHAT_CONFIG;
  const url = `${apiBaseUrl}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.errcode) {
      throw new Error(
        `获取 access_token 失败: ${data.errmsg} (Code: ${data.errcode})`
      );
    }

    return data.access_token;
  } catch (error: any) {
    console.error("获取 access_token 失败:", error.message);
    throw new Error("获取 access_token 失败");
  }
}

/**
 * 发送订阅消息
 * 文档: https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/sendMessage.html
 *
 * @param touser - 接收者的 OpenID
 * @param templateId - 订阅消息模板 ID
 * @param data - 模板数据
 * @param page - 点击消息跳转的页面（可选）
 */
export async function sendSubscribeMessage(
  touser: string,
  templateId: string,
  data: Record<string, { value: string }>,
  page?: string
) {
  // 现在使用真实OpenID，直接发送订阅消息

  try {
    const accessToken = await getAccessToken();
    const url = `${WECHAT_CONFIG.apiBaseUrl}/cgi-bin/message/subscribe/send?access_token=${accessToken}`;

    const payload = {
      touser,
      template_id: templateId,
      page: page || "pages/order/index", // 默认跳转到订单页面
      data,
      miniprogram_state:
        process.env.NODE_ENV === "production" ? "formal" : "developer", // 正式版 or 开发版
      lang: "zh_CN",
    };

    console.log("📤 发送订阅消息:", payload);

    const response = await axios.post(url, payload);
    const result = response.data;

    if (result.errcode === 0) {
      console.log("✅ 订阅消息发送成功");
      return { success: true, message: "订阅消息发送成功" };
    } else {
      console.error("❌ 订阅消息发送失败:", result);
      return { success: false, message: result.errmsg, code: result.errcode };
    }
  } catch (error: any) {
    console.error("发送订阅消息异常:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * 发送点餐成功通知
 * 模板ID: uAhvMsr0N9n9bjCu64gxX0oZTAsjgUIxnxsSvgVN16s
 * 模板内容:
 * - 点餐内容 {{thing2.DATA}}
 * - 备注 {{thing9.DATA}}
 * - 点餐时间 {{time4.DATA}}
 */
export async function sendOrderSuccessNotice(
  openid: string,
  orderContent: string,
  remark: string,
  orderTime: string
) {
  const templateId = WECHAT_CONFIG.templateIds.orderSuccess;

  const data = {
    thing2: {
      value:
        orderContent.length > 20
          ? orderContent.substring(0, 17) + "..."
          : orderContent,
    },
    thing9: {
      value:
        remark.length > 20 ? remark.substring(0, 17) + "..." : remark || "无",
    },
    time4: {
      value: orderTime,
    },
  };

  return await sendSubscribeMessage(
    openid,
    templateId,
    data,
    "pages/order/index"
  );
}
