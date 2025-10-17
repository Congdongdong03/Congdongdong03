import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/dishes
 * 获取所有菜品
 */
router.get("/", async (req, res) => {
  try {
    const dishes = await prisma.dish.findMany({
      where: { isAvailable: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(dishes);
  } catch (error) {
    console.error("获取菜品失败:", error);
    res.status(500).json({ error: "获取菜品失败" });
  }
});

/**
 * GET /api/dishes/:id
 * 获取单个菜品详情
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const dish = await prisma.dish.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!dish) {
      return res.status(404).json({ error: "菜品不存在" });
    }
    res.json(dish);
  } catch (error) {
    console.error("获取菜品失败:", error);
    res.status(500).json({ error: "获取菜品失败" });
  }
});

/**
 * POST /api/dishes
 * 创建新菜品
 */
router.post("/", async (req, res) => {
  try {
    const { name, description, image, price, categoryId } = req.body;

    // 检查菜品名称是否已存在
    const existingDish = await prisma.dish.findUnique({
      where: { name },
    });

    if (existingDish) {
      return res.status(400).json({ error: "菜品名称已存在" });
    }

    const dish = await prisma.dish.create({
      data: {
        name,
        description,
        image: image || "/assets/icons/default-food.png",
        price,
        categoryId,
      },
      include: { category: true },
    });
    res.json(dish);
  } catch (error) {
    console.error("创建菜品失败:", error);
    res.status(500).json({ error: "创建菜品失败" });
  }
});

/**
 * PUT /api/dishes/:id
 * 更新菜品
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, price, categoryId } = req.body;

    const dish = await prisma.dish.update({
      where: { id },
      data: {
        name,
        description,
        image,
        price,
        categoryId,
      },
      include: { category: true },
    });
    res.json(dish);
  } catch (error) {
    console.error("更新菜品失败:", error);
    res.status(500).json({ error: "更新菜品失败" });
  }
});

/**
 * DELETE /api/dishes/:id
 * 删除菜品（软删除）
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const dish = await prisma.dish.update({
      where: { id },
      data: { isAvailable: false },
    });
    res.json(dish);
  } catch (error) {
    console.error("删除菜品失败:", error);
    res.status(500).json({ error: "删除菜品失败" });
  }
});

/**
 * GET /api/dishes/:id/materials
 * 获取菜品的原材料列表
 */
router.get("/:id/materials", async (req, res) => {
  try {
    const { id } = req.params;

    const materials = await prisma.dishMaterial.findMany({
      where: { dishId: id },
      include: {
        item: true, // 包含库存信息
      },
    });

    res.json(materials);
  } catch (error) {
    console.error("获取菜品原材料失败:", error);
    res.status(500).json({ error: "获取菜品原材料失败" });
  }
});

/**
 * POST /api/dishes/:id/materials
 * 为菜品添加原材料
 */
router.post("/:id/materials", async (req, res) => {
  try {
    const { id } = req.params;
    const { itemId, amount } = req.body;

    // 检查是否已存在相同的关联
    const existing = await prisma.dishMaterial.findFirst({
      where: {
        dishId: id,
        itemId,
      },
    });

    if (existing) {
      return res.status(400).json({ error: "该原材料已添加" });
    }

    const material = await prisma.dishMaterial.create({
      data: {
        dishId: id,
        itemId,
        amount: amount || 1,
      },
      include: {
        item: true,
      },
    });

    res.json(material);
  } catch (error) {
    console.error("添加菜品原材料失败:", error);
    res.status(500).json({ error: "添加菜品原材料失败" });
  }
});

/**
 * DELETE /api/dishes/:id/materials/:materialId
 * 删除菜品的某个原材料
 */
router.delete("/:id/materials/:materialId", async (req, res) => {
  try {
    const { materialId } = req.params;

    await prisma.dishMaterial.delete({
      where: { id: materialId },
    });

    res.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除菜品原材料失败:", error);
    res.status(500).json({ error: "删除菜品原材料失败" });
  }
});

export default router;
