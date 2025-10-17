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
    // 🔧 修复：优先使用 operatorUserId（操作者ID），而不是 userId（目标用户ID）
    const operatorUserId = req.body.operatorUserId || req.query.operatorUserId;
    const targetUserId = req.body.userId || req.query.userId;

    // 开发模式：如果没有提供操作者ID，允许通过
    if (IS_DEV && !operatorUserId) {
      console.log("⚠️ 开发模式：跳过权限验证");
      return next();
    }

    console.log(
      "🔍 权限验证：操作者ID =",
      operatorUserId,
      "目标用户ID =",
      targetUserId
    );

    if (!operatorUserId) {
      return res.status(401).json({ error: "缺少操作者用户ID" });
    }

    // 查询操作者用户角色（不是目标用户）
    console.log("🔍 查询操作者用户角色，operatorUserId:", operatorUserId);
    const operatorUser = await prisma.user.findUnique({
      where: { id: operatorUserId as string },
    });

    console.log("🔍 操作者查询结果:", operatorUser);

    if (!operatorUser) {
      console.log("❌ 操作者用户不存在");
      return res.status(404).json({ error: "操作者用户不存在" });
    }

    if (operatorUser.role !== "chef") {
      console.log("❌ 操作者用户角色不是chef:", operatorUser.role);
      return res.status(403).json({ error: "需要大厨权限" });
    }

    console.log(
      "✅ 权限验证通过，操作者:",
      operatorUser.nickname,
      "角色:",
      operatorUser.role
    );

    // 验证通过，继续执行
    next();
  } catch (error) {
    console.error("权限验证失败:", error);
    res.status(500).json({ error: "权限验证失败" });
  }
};
