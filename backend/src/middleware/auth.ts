import { Request, Response, NextFunction } from "express";
import prisma from "../db/prisma";

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
  console.log("🔍 权限验证中间件开始执行");

  try {
    const operatorUserId = req.query.operatorUserId;
    console.log("🔍 获取到的 operatorUserId:", operatorUserId);

    if (!operatorUserId) {
      console.log("❌ 缺少操作者用户ID");
      return res.status(401).json({ error: "缺少操作者用户ID" });
    }

    console.log("🔍 开始查询用户，ID:", operatorUserId);
    const operatorUser = await prisma.user.findUnique({
      where: { id: operatorUserId as string },
    });
    console.log("🔍 查询结果:", operatorUser);

    if (!operatorUser) {
      console.log("❌ 操作者用户不存在");
      return res.status(404).json({ error: "操作者用户不存在" });
    }

    if (operatorUser.role !== "chef") {
      console.log("❌ 操作者用户角色不是chef:", operatorUser.role);
      return res.status(403).json({ error: "需要大厨权限" });
    }

    console.log("✅ 权限验证通过");
    next();
  } catch (error: any) {
    console.error("❌ 权限验证异常:", error);
    res.status(500).json({ error: "权限验证失败", details: error.message });
  }
};
