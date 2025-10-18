import { Request, Response, NextFunction } from "express";
import prisma from "../db/prisma";

// 开发模式标识
const IS_DEV = process.env.NODE_ENV !== "production";

/**
 * 验证Chef权限的中间件
 * 权限规则：基于数据库中的用户角色进行验证
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

    // 🔧 基于数据库中的角色进行权限验证，不再硬编码
    console.log("🔍 权限检查:", {
      nickname: operatorUser.nickname,
      openid: operatorUser.openid,
      role: operatorUser.role,
    });

    if (operatorUser.role !== "chef") {
      console.log("❌ 权限验证失败：用户角色不是大厨");
      return res.status(403).json({ error: "需要大厨权限" });
    }

    console.log("✅ 权限验证通过");
    next();
  } catch (error: any) {
    console.error("❌ 权限验证异常:", error);
    res.status(500).json({ error: "权限验证失败", details: error.message });
  }
};
