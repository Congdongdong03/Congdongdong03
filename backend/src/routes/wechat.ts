import express from "express";
import { getOpenIdByCode } from "../services/wechat.service";
import prisma from "../db/prisma";

const router = express.Router();

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

    // 先检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { openid },
    });

    const isNewUser = !existingUser;

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
        points: 0, // 新用户初始积分为0
      },
    });

    // 🎯 控制台标注：新用户 vs 老用户
    if (isNewUser) {
      console.log("🆕 ========== 新用户注册 ==========");
      console.log(`📱 OpenID: ${openid}`);
      console.log(`👤 昵称: ${user.nickname}`);
      console.log(`💰 初始积分: ${user.points}`);
      console.log(`🎉 欢迎新用户加入！`);
      console.log("=====================================");
    } else {
      console.log("🔄 ========== 老用户登录 ==========");
      console.log(`📱 OpenID: ${openid}`);
      console.log(`👤 昵称: ${user.nickname}`);
      console.log(`💰 当前积分: ${user.points}`);
      console.log(`🏷️ 角色: ${user.role === "chef" ? "👨‍🍳 大厨" : "🍽️ 食客"}`);
      console.log(
        `📅 上次登录: ${existingUser.updatedAt.toLocaleString("zh-CN")}`
      );
      console.log("=====================================");
    }

    // 返回符合前端期望的格式
    res.json({
      success: true,
      data: {
        openid,
        session_key,
        user,
        isNewUser, // 🆕 添加新用户标识
      },
    });
  } catch (error: any) {
    console.error("获取OpenID失败:", error);
    res.status(500).json({
      error: error.message || "获取OpenID失败",
    });
  }
});

export default router;
