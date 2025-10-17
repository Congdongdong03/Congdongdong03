import express from "express";
import { verifyChefRole } from "../middleware/auth";
import prisma from "../db/prisma";

const router = express.Router();

/**
 * GET /api/settings/notice
 * 获取温馨提示文本
 */
router.get("/notice", async (req, res) => {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: "notice" },
    });

    if (!setting) {
      // 如果不存在，返回默认值
      return res.json({
        noticeText: "欢迎使用菜单小程序！",
      });
    }

    // 返回前端期望的格式
    res.json({
      noticeText: setting.value,
    });
  } catch (error) {
    console.error("获取温馨提示失败:", error);
    res.status(500).json({ error: "获取温馨提示失败" });
  }
});

/**
 * PUT /api/settings/notice
 * 更新温馨提示（需要Chef权限）
 */
router.put("/notice", verifyChefRole, async (req, res) => {
  try {
    const { noticeText } = req.body;

    if (!noticeText) {
      return res.status(400).json({ error: "缺少noticeText参数" });
    }

    const setting = await prisma.settings.upsert({
      where: { key: "notice" },
      update: {
        value: noticeText,
      },
      create: {
        key: "notice",
        value: noticeText,
      },
    });

    res.json(setting);
  } catch (error) {
    console.error("更新温馨提示失败:", error);
    res.status(500).json({ error: "更新温馨提示失败" });
  }
});

export default router;
