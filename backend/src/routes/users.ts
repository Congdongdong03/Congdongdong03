import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyChefRole } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:../../prisma/dev.db",
    },
  },
});

/**
 * GET /api/users/:openid
 * 根据openid获取用户信息
 */
router.get("/:openid", async (req, res) => {
  try {
    const { openid } = req.params;

    const user = await prisma.user.findUnique({
      where: { openid },
    });

    if (!user) {
      return res.status(404).json({ error: "用户不存在" });
    }

    res.json(user);
  } catch (error) {
    console.error("获取用户失败:", error);
    res.status(500).json({ error: "获取用户失败" });
  }
});

/**
 * GET /api/users?userId=xxx
 * 获取所有用户列表（需要Chef权限）
 */
router.get("/", verifyChefRole, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (error) {
    console.error("获取用户列表失败:", error);
    res.status(500).json({ error: "获取用户列表失败" });
  }
});

/**
 * PUT /api/users/:openid
 * 更新用户信息（昵称和头像）
 * 🎯 特殊规则：如果昵称是 "Wesley"，自动设置为大厨角色
 */
router.put("/:openid", async (req, res) => {
  try {
    const { openid } = req.params;
    const { nickname, avatar } = req.body;

    // 🔧 如果昵称是 "Wesley"，自动设置为大厨
    const role = nickname === "Wesley" ? "chef" : undefined;

    const updateData: any = {
      nickname,
      avatar,
    };

    // 只有当昵称是 "Wesley" 时才更新 role
    if (role) {
      updateData.role = role;
      console.log("✨ 检测到昵称为 Wesley，自动设置为大厨角色！");
    }

    const user = await prisma.user.update({
      where: { openid },
      data: updateData,
    });

    res.json(user);
  } catch (error) {
    console.error("更新用户信息失败:", error);
    res.status(500).json({ error: "更新用户信息失败" });
  }
});

export default router;
