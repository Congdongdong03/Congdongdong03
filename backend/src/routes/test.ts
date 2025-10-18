import express from "express";
import { sendOrderSuccessNotice } from "../services/subscribeMessage.service";
import { WECHAT_CONFIG } from "../config/wechat.config";

const router = express.Router();

/**
 * GET /api/test/send-admin-message
 * 测试发送订阅消息给管理员（无需参数）
 */
router.get("/send-admin-message", async (req, res) => {
  try {
    console.log("🧪 开始测试发送订阅消息...");
    console.log("📧 管理员 OpenID:", WECHAT_CONFIG.adminOpenId);

    if (!WECHAT_CONFIG.adminOpenId) {
      return res.status(400).json({
        error: "管理员 OpenID 未配置",
        tip: "请在 .env 文件中配置 ADMIN_OPENID",
      });
    }

    const orderContent = "【测试订单】番茄炒蛋×2、可乐鸡翅×1";
    const remark = "这是一条测试消息";
    const orderTime = new Date().toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    console.log("📤 准备发送测试消息:", { orderContent, remark, orderTime });

    const result = await sendOrderSuccessNotice(
      WECHAT_CONFIG.adminOpenId,
      orderContent,
      remark,
      orderTime
    );

    console.log("📥 发送结果:", result);

    res.json({
      ...result,
      adminOpenId: WECHAT_CONFIG.adminOpenId,
      message: result.success
        ? "✅ 测试消息已发送！请查看微信服务通知"
        : `❌ 发送失败: ${result.message}`,
    });
  } catch (error: any) {
    console.error("测试发送订阅消息失败:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/test/send-message
 * 测试发送订阅消息
 * 请求体: { openid, orderContent, remark, orderTime }
 */
router.post("/send-message", async (req, res) => {
  try {
    const { openid, orderContent, remark, orderTime } = req.body;

    if (!openid) {
      return res.status(400).json({ error: "缺少 openid 参数" });
    }

    const result = await sendOrderSuccessNotice(
      openid,
      orderContent || "番茄炒蛋×1、可乐鸡翅×2",
      remark || "少盐少油",
      orderTime || new Date().toLocaleString("zh-CN")
    );

    res.json(result);
  } catch (error: any) {
    console.error("测试发送订阅消息失败:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
