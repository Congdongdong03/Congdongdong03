const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log("🧹 开始清除数据库...");

  try {
    // 删除所有用户
    const deletedUsers = await prisma.user.deleteMany();
    console.log(`✅ 删除了 ${deletedUsers.count} 个用户`);

    // 删除所有订单
    const deletedOrders = await prisma.order.deleteMany();
    console.log(`✅ 删除了 ${deletedOrders.count} 个订单`);

    // 删除所有积分记录
    const deletedPoints = await prisma.pointsHistory.deleteMany();
    console.log(`✅ 删除了 ${deletedPoints.count} 条积分记录`);

    // 删除所有设置
    const deletedSettings = await prisma.settings.deleteMany();
    console.log(`✅ 删除了 ${deletedSettings.count} 条设置记录`);

    console.log("🎉 数据库清除完成！");
    console.log("💡 现在所有用户都需要重新登录，系统将自然创建用户");
  } catch (error) {
    console.error("❌ 清除数据库失败:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
