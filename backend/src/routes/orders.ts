import express from "express";
import { verifyChefRole } from "../middleware/auth";
import { sendOrderSuccessNotice } from "../services/subscribeMessage.service";
import prisma from "../db/prisma";

const router = express.Router();

// 测试接口
router.get("/test", async (req, res) => {
  try {
    const count = await prisma.order.count();
    const orders = await prisma.order.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      message: "订单路由数据库连接正常",
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

// 调试权限验证接口
router.get("/debug-auth", async (req, res) => {
  try {
    const operatorUserId = req.query.operatorUserId;
    console.log("🔍 调试权限验证，operatorUserId:", operatorUserId);

    if (!operatorUserId) {
      return res.json({ error: "缺少 operatorUserId 参数" });
    }

    const user = await prisma.user.findUnique({
      where: { id: operatorUserId as string },
    });

    res.json({
      operatorUserId,
      user,
      userExists: !!user,
      userRole: user?.role,
      isChef: user?.role === "chef",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/orders/all?operatorUserId=xxx
 * 获取所有订单（需要Chef权限）
 */
router.get("/all", verifyChefRole, async (req, res) => {
  try {
    console.log("🔍 开始查询所有订单...");
    console.log("🔍 数据库URL:", process.env.DATABASE_URL);
    console.log("🔍 请求参数:", req.query);

    // 先测试简单的查询
    const count = await prisma.order.count();
    console.log("📊 订单总数:", count);

    if (count === 0) {
      console.log("⚠️ 数据库中没有订单，返回空数组");
      return res.json([]);
    }

    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("📊 查询到订单数量:", orders.length);
    orders.forEach((order) => {
      console.log(
        `订单 ${order.id}: 状态=${order.status}, 用户=${order.userId}`
      );
    });

    // 将状态转换为小写，以匹配前端期望
    const formattedOrders = orders.map((order) => ({
      ...order,
      status: order.status.toLowerCase(),
    }));

    console.log("📤 返回格式化后的订单数量:", formattedOrders.length);
    res.json(formattedOrders);
  } catch (error: any) {
    console.error("获取所有订单失败:", error);
    console.error("错误详情:", error.message);
    console.error("错误堆栈:", error.stack);
    res.status(500).json({ error: "获取所有订单失败", details: error.message });
  }
});

/**
 * GET /api/orders/:userId
 * 获取指定用户的订单列表
 */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 将状态转换为小写，以匹配前端期望
    const formattedOrders = orders.map((order) => ({
      ...order,
      status: order.status.toLowerCase(),
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("获取用户订单失败:", error);
    res.status(500).json({ error: "获取用户订单失败" });
  }
});

/**
 * POST /api/orders
 * 创建订单，扣除用户积分，记录积分历史
 */
router.post("/", async (req, res) => {
  try {
    const { userId, items, totalPoints, remark } = req.body;

    // 验证用户积分是否足够
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "用户不存在" });
    }

    if (user.points < totalPoints) {
      return res.status(400).json({
        error: `积分不足，当前积分: ${user.points}，需要: ${totalPoints}`,
      });
    }

    // 使用事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 1. 扣除用户积分
      await tx.user.update({
        where: { id: userId },
        data: {
          points: {
            decrement: totalPoints,
          },
        },
      });

      // 2. 创建订单
      const order = await tx.order.create({
        data: {
          userId,
          total: totalPoints, // 保持兼容性
          totalPoints,
          remark: remark || null,
          items: {
            create: items.map((item: any) => ({
              dishId: item.dishId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // 3. 记录积分历史
      await tx.pointsHistory.create({
        data: {
          userId,
          amount: -totalPoints,
          type: "spend",
          description: `下单消费 ${totalPoints} 积分`,
        },
      });

      return order;
    });

    // 发送订阅消息通知（异步，不阻塞响应）
    // 获取用户信息以获取 openid
    const userWithOpenId = await prisma.user.findUnique({
      where: { id: userId },
    });

    console.log("🔍 查找用户信息:", userWithOpenId);

    if (userWithOpenId?.openid) {
      // 生成订单内容摘要
      const orderContent = items
        .map((item: any) => `${item.name}×${item.quantity}`)
        .join("、");

      // 格式化订单时间
      const orderTime = new Date().toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      // 异步发送订阅消息（不等待结果）
      sendOrderSuccessNotice(
        userWithOpenId.openid,
        orderContent,
        remark || "无",
        orderTime
      )
        .then((sendResult) => {
          if (sendResult.success) {
            console.log(`✅ 已向用户 ${userWithOpenId.nickname} 发送订单通知`);
          } else {
            console.warn(
              `⚠️ 向用户 ${userWithOpenId.nickname} 发送订单通知失败: ${sendResult.message}`
            );
          }
        })
        .catch((err) => {
          console.error("发送订阅消息异常:", err);
        });
    }

    // 将状态转换为小写，以匹配前端期望
    const formattedResult = {
      ...result,
      status: result.status.toLowerCase(),
    };

    res.json(formattedResult);
  } catch (error) {
    console.error("创建订单失败:", error);
    res.status(500).json({ error: "创建订单失败" });
  }
});

/**
 * PUT /api/orders/:id/status
 * 更新订单状态
 */
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        user: true,
      },
    });

    res.json(order);
  } catch (error) {
    console.error("更新订单状态失败:", error);
    res.status(500).json({ error: "更新订单状态失败" });
  }
});

/**
 * DELETE /api/orders/:id
 * 取消订单，退还积分，记录积分历史
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 查询订单
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({ error: "订单不存在" });
    }

    // 只能取消待处理的订单
    if (order.status !== "PENDING") {
      return res.status(400).json({
        error: "只能取消待处理的订单",
      });
    }

    // 使用事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 1. 退还用户积分
      await tx.user.update({
        where: { id: order.userId },
        data: {
          points: {
            increment: order.totalPoints,
          },
        },
      });

      // 2. 更新订单状态为已取消
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
        },
        include: {
          items: true,
        },
      });

      // 3. 记录积分历史
      await tx.pointsHistory.create({
        data: {
          userId: order.userId,
          amount: order.totalPoints,
          type: "refund",
          description: `取消订单退还 ${order.totalPoints} 积分`,
        },
      });

      return updatedOrder;
    });

    res.json(result);
  } catch (error) {
    console.error("取消订单失败:", error);
    res.status(500).json({ error: "取消订单失败" });
  }
});

export default router;
