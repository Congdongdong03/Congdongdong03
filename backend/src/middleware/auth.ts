import { Request, Response, NextFunction } from "express";
import prisma from "../db/prisma";

// 开发模式标识
const IS_DEV = process.env.NODE_ENV !== "production";

/**
 * 验证Chef权限的中间件
 * 权限规则：昵称是 "Wesley" 或 OpenID 是 "o9k7x60psm724DLlAw97yYpxskh8"
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

    // 新的权限验证规则：昵称是 "Wesley" 或 OpenID 是 "o9k7x60psm724DLlAw97yYpxskh8"
    const isWesleyNickname = operatorUser.nickname === "Wesley";
    const isWesleyOpenId =
      operatorUser.openid === "o9k7x60psm724DLlAw97yYpxskh8";

    console.log("🔍 权限检查:", {
      nickname: operatorUser.nickname,
      openid: operatorUser.openid,
      isWesleyNickname,
      isWesleyOpenId,
    });

    if (!isWesleyNickname && !isWesleyOpenId) {
      console.log("❌ 权限验证失败：不是 Wesley 用户");
      return res.status(403).json({ error: "需要大厨权限" });
    }

    console.log("✅ 权限验证通过");
    next();
  } catch (error: any) {
    console.error("❌ 权限验证异常:", error);
    res.status(500).json({ error: "权限验证失败", details: error.message });
  }
};
