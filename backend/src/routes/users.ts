import express from "express";
import { verifyChefRole } from "../middleware/auth";
import prisma from "../db/prisma";

const router = express.Router();

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
 * GET /api/users?operatorUserId=xxx
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
 * 🔧 自动提升Wesley为大厨，其他用户保持原有角色
 */
router.put("/:openid", async (req, res) => {
  try {
    const { openid } = req.params;
    const { nickname, avatar } = req.body;

    const updateData: any = {
      nickname,
      avatar,
    };

    // Auto-promote logic: If nickname is "Wesley", grant chef role
    if (nickname === "Wesley") {
      updateData.role = "chef";
      console.log("🔧 自动提升用户为大厨: Wesley");
    }

    console.log("📝 更新用户信息");

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
