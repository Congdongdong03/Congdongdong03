import express from "express";
import { verifyChefRole } from "../middleware/auth";
import prisma from "../db/prisma";

const router = express.Router();

/**
 * POST /api/points/reward
 * 奖励积分（需要Chef权限）
 */
router.post("/reward", async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: "缺少必要参数" });
    }

    // 使用事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 1. 更新用户积分
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: amount,
          },
        },
      });

      // 2. 记录积分历史
      const history = await tx.pointsHistory.create({
        data: {
          userId,
          amount,
          type: "reward",
          description: description || `管理员奖励 ${amount} 积分`,
        },
      });

      return { user, history };
    });

    res.json(result);
  } catch (error) {
    console.error("奖励积分失败:", error);
    res.status(500).json({ error: "奖励积分失败" });
  }
});

/**
 * POST /api/points/deduct
 * 扣减积分（需要Chef权限）
 */
router.post("/deduct", async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: "缺少必要参数" });
    }

    // 验证用户积分是否足够
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "用户不存在" });
    }

    if (user.points < amount) {
      return res.status(400).json({
        error: `积分不足，当前积分: ${user.points}，需要扣减: ${amount}`,
      });
    }

    // 使用事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 1. 更新用户积分
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          points: {
            decrement: amount,
          },
        },
      });

      // 2. 记录积分历史
      const history = await tx.pointsHistory.create({
        data: {
          userId,
          amount: -amount,
          type: "deduct",
          description: description || `管理员扣减 ${amount} 积分`,
        },
      });

      return { user: updatedUser, history };
    });

    res.json(result);
  } catch (error) {
    console.error("扣减积分失败:", error);
    res.status(500).json({ error: "扣减积分失败" });
  }
});

/**
 * GET /api/points/history/:userId
 * 获取用户积分历史
 */
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await prisma.pointsHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(history);
  } catch (error) {
    console.error("获取积分历史失败:", error);
    res.status(500).json({ error: "获取积分历史失败" });
  }
});

export default router;
