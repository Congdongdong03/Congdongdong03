import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

/**
 * 统一错误处理中间件
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  // Prisma 错误处理
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // 唯一约束违反
    if (err.code === "P2002") {
      return res.status(400).json({
        error: `${err.meta?.target || "字段"}已存在`,
      });
    }

    // 记录不存在
    if (err.code === "P2025") {
      return res.status(404).json({
        error: "记录不存在",
      });
    }

    // 外键约束违反
    if (err.code === "P2003") {
      return res.status(400).json({
        error: "关联数据不存在",
      });
    }
  }

  // Prisma 验证错误
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      error: "数据验证失败",
    });
  }

  // 自定义错误
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message || "请求失败",
    });
  }

  // 默认错误
  res.status(500).json({
    error: err.message || "服务器内部错误",
  });
};
