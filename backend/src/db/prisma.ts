import { PrismaClient } from "@prisma/client";

/**
 * 共享的 Prisma 客户端实例
 * 使用单例模式避免创建多个数据库连接
 */
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // 在开发环境中，使用全局变量避免热重载时创建多个实例
  const globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };

  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient({
      log: ["error", "warn"],
    });
  }
  prisma = globalWithPrisma.prisma;
}

export default prisma;
