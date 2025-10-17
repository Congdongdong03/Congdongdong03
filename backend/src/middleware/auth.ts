import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:../../prisma/dev.db",
    },
  },
});

// 开发模式标识
const IS_DEV = process.env.NODE_ENV !== "production";

/**
 * 验证Chef权限的中间件（宽松模式）
 * 开发环境下会跳过严格验证
 */
export const verifyChefRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId =
      req.query.userId || req.body.userId || req.body.operatorUserId;

    // 开发模式：如果没有提供userId，允许通过
    if (IS_DEV && !userId) {
      console.log("⚠️ 开发模式：跳过权限验证");
      return next();
    }

    console.log("🔍 权限验证：userId =", userId);

    if (!userId) {
      return res.status(401).json({ error: "缺少用户ID" });
    }

    // 查询用户角色
    console.log("🔍 查询用户角色，userId:", userId);
    const user = await prisma.user.findUnique({
      where: { id: userId as string },
    });

    console.log("🔍 查询结果:", user);

    if (!user) {
      console.log("❌ 用户不存在");
      return res.status(404).json({ error: "用户不存在" });
    }

    if (user.role !== "chef") {
      console.log("❌ 用户角色不是chef:", user.role);
      return res.status(403).json({ error: "需要大厨权限" });
    }

    console.log("✅ 权限验证通过");

    // 验证通过，继续执行
    next();
  } catch (error) {
    console.error("权限验证失败:", error);
    res.status(500).json({ error: "权限验证失败" });
  }
};
