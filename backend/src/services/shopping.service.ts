import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 生成购物清单
 * 筛选库存不足的原材料（quantity <= 5）
 */
export const generateShoppingList = async () => {
  try {
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        quantity: {
          lte: 5, // 小于等于5个的物品
        },
      },
      orderBy: {
        quantity: "asc", // 按数量升序排列，最缺的在前面
      },
    });

    return lowStockItems.map((item) => ({
      ...item,
      needToBuy: true,
      suggestedQuantity: 20, // 建议采购数量
    }));
  } catch (error) {
    console.error("生成购物清单失败:", error);
    throw error;
  }
};
