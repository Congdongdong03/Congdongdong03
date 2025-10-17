import express from "express";
import { PrismaClient } from "@prisma/client";
import { getOpenIdByCode } from "../services/wechat.service";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/wechat/get-openid
 * 通过微信code获取openid，并自动创建或更新用户
 */
router.get("/get-openid", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "缺少code参数" });
    }

    // 调用微信API获取openid
    const { openid, session_key } = await getOpenIdByCode(code as string);

    // 查找或创建用户
    const user = await prisma.user.upsert({
      where: { openid },
      update: {
        // 如果用户已存在，更新updatedAt
        updatedAt: new Date(),
      },
      create: {
        openid,
        nickname: "微信用户",
        role: "diner",
        points: 100, // 新用户初始积分
      },
    });

    res.json({
      openid,
      session_key,
      user,
    });
  } catch (error: any) {
    console.error("获取OpenID失败:", error);
    res.status(500).json({
      error: error.message || "获取OpenID失败",
    });
  }
});

export default router;
