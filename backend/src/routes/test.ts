import express from "express";
import { sendOrderSuccessNotice } from "../services/subscribeMessage.service";

const router = express.Router();

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
