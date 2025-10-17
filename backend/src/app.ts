import express from "express";
import { PrismaClient } from "@prisma/client";
import path from "path";
import https from "https";
import fs from "fs";
import { errorHandler } from "./middleware/errorHandler";

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

const app = express();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:../prisma/dev.db",
    },
  },
});
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

// 购物清单路由（特殊处理，因为它不在 /api/inventory 下）
import { generateShoppingList } from "./services/shopping.service";
app.get("/api/shopping-list", async (req, res) => {
  try {
    const shoppingList = await generateShoppingList();
    res.json(shoppingList);
  } catch (error) {
    console.error("获取购物清单失败:", error);
    res.status(500).json({ error: "获取购物清单失败" });
  }
});

// 错误处理中间件（必须在所有路由之后）
app.use(errorHandler);

// 启动HTTPS服务器
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "../ssl/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "../ssl/cert.pem")),
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`✅ HTTPS服务器运行在端口 ${PORT}`);
  console.log(`📍 API地址: https://localhost:${PORT}/api`);
  console.log(`🔒 使用HTTPS协议，支持微信小程序图片显示`);
});

export default app;
