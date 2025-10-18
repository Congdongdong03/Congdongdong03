import express from "express";
import path from "path";
import https from "https";
import fs from "fs";
import { errorHandler } from "./middleware/errorHandler";
import prisma from "./db/prisma";

// 导入所有路由
import categoriesRouter from "./routes/categories";
import dishesRouter from "./routes/dishes";
import usersRouter from "./routes/users";
import ordersRouter from "./routes/orders";
import inventoryRouter from "./routes/inventory";
import pointsRouter from "./routes/points";
import wechatRouter from "./routes/wechat";
import settingsRouter from "./routes/settings";
import uploadRouter from "./routes/upload";
import testRouter from "./routes/test";
import adminRouter from "./routes/admin";

const app = express();

// 确保数据库 URL 已配置（生产环境和开发环境统一使用 PostgreSQL）
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL environment variable is not set!");
  console.error("Please create a .env file in the backend directory with:");
  console.error(
    'DATABASE_URL="postgresql://user@localhost:5432/database_name"'
  );
  process.exit(1);
}
const PORT = process.env.PORT || 3001;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 提供图片访问
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/tmp", express.static(path.join(__dirname, "../tmp")));
app.use("/assets", express.static(path.join(__dirname, "../assets")));

// CORS 中间件
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 基础路由
app.get("/", (req, res) => {
  res.json({ message: "菜单小程序后端服务运行中" });
});

// 测试数据库连接
app.get("/test-db", async (req, res) => {
  try {
    const count = await prisma.order.count();
    const orders = await prisma.order.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      message: "数据库连接正常",
      orderCount: count,
      recentOrders: orders.map((order) => ({
        id: order.id,
        status: order.status,
        userId: order.userId,
        createdAt: order.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 调试端点：检查 Prisma 配置
app.get("/debug/prisma", (req, res) => {
  const config = {
    databaseUrl: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.substring(0, 20) + "..."
      : "未设置",
    nodeEnv: process.env.NODE_ENV,
    render: process.env.RENDER,
    prismaClientVersion: require("@prisma/client").PrismaClient.name,
  };

  res.json({
    message: "Prisma 配置信息",
    config,
    timestamp: new Date().toISOString(),
  });
});

// 注册所有API路由
app.use("/api/categories", categoriesRouter);
app.use("/api/dishes", dishesRouter);
app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/points", pointsRouter);
app.use("/api/wechat", wechatRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/test", testRouter);
app.use("/api/admin", adminRouter);

// 数据库种子初始化端点（仅在生产环境可用）
app.post("/api/seed", async (req, res) => {
  // 只在生产环境允许运行种子
  if (!process.env.RENDER) {
    return res.status(403).json({ error: "种子功能仅在生产环境可用" });
  }

  try {
    console.log("🌱 开始运行数据库种子...");

    // 动态导入种子函数
    const { execSync } = require("child_process");

    // 运行种子脚本
    execSync("node dist/seed.js", { stdio: "pipe" });

    console.log("✅ 数据库种子运行完成");
    res.json({
      success: true,
      message: "数据库种子数据初始化成功！",
      data: {
        categories: ["主食", "素菜", "凉菜", "汤品", "甜品"],
        dishes: ["可乐鸡翅", "番茄炒蛋", "红烧肉", "蒜蓉西兰花", "拍黄瓜"],
        users: ["亲爱的(chef)", "小美(diner)"],
      },
    });
  } catch (error: any) {
    console.error("❌ 数据库种子运行失败:", error);
    res.status(500).json({
      error: "数据库种子运行失败",
      details: error.message,
    });
  }
});

// 错误处理中间件（必须在所有路由之后）
app.use(errorHandler);

// 启动服务器 - 根据环境选择协议
const isProduction =
  process.env.NODE_ENV === "production" || process.env.RENDER;

if (isProduction) {
  // 生产环境（Render）：强制使用 HTTP
  console.log("🌍 Production environment detected - using HTTP");
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`✅ Server is live and listening on port ${PORT}`);
    console.log(`🌍 Listening on 0.0.0.0:${PORT}`);
    console.log(`📍 Ready to accept external connections`);
    console.log(`🔗 Render will handle HTTPS automatically`);
  });
} else {
  // 本地开发环境：尝试使用 HTTPS（如果证书存在）
  const sslKeyPath = path.join(__dirname, "../ssl/key.pem");
  const sslCertPath = path.join(__dirname, "../ssl/cert.pem");
  const hasSslCerts = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);

  if (hasSslCerts) {
    try {
      const httpsOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath),
      };

      https
        .createServer(httpsOptions, app)
        .listen(Number(PORT), "0.0.0.0", () => {
          console.log(`✅ HTTPS服务器运行在端口 ${PORT}`);
          console.log(`📍 API地址: https://localhost:${PORT}/api`);
          console.log(`🔒 使用HTTPS协议，支持微信小程序图片显示`);
        });
    } catch (error) {
      console.error("❌ HTTPS服务器启动失败:", error);
      process.exit(1);
    }
  } else {
    // 本地开发但没有证书，使用 HTTP
    console.log("⚠️  SSL证书未找到，使用HTTP模式");
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`✅ HTTP服务器运行在端口 ${PORT}`);
      console.log(`📍 API地址: http://localhost:${PORT}/api`);
    });
  }
}

export default app;
