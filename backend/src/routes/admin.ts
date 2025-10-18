import express from "express";
import prisma from "../db/prisma";

const router = express.Router();

/**
 * PUT /api/admin/users/:openid/role
 * 管理员设置用户角色（仅用于开发/测试）
 */
router.put("/users/:openid/role", async (req, res) => {
  try {
    const { openid } = req.params;
    const { role } = req.body;

    if (!role || !["chef", "diner"].includes(role)) {
      return res.status(400).json({ error: "角色必须是 'chef' 或 'diner'" });
    }

    const user = await prisma.user.update({
      where: { openid },
      data: { role },
    });

    console.log(`🔧 管理员设置用户角色: ${user.nickname} -> ${role}`);
    res.json(user);
  } catch (error) {
    console.error("设置用户角色失败:", error);
    res.status(500).json({ error: "设置用户角色失败" });
  }
});

/**
 * GET /api/admin/users
 * 获取所有用户（管理员功能）
 */
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        openid: true,
        nickname: true,
        role: true,
        points: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (error) {
    console.error("获取用户列表失败:", error);
    res.status(500).json({ error: "获取用户列表失败" });
  }
});

export default router;
