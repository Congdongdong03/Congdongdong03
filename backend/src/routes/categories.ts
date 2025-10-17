import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/categories
 * 获取所有分类
 */
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    res.json(categories);
  } catch (error) {
    console.error("获取分类失败:", error);
    res.status(500).json({ error: "获取分类失败" });
  }
});

/**
 * POST /api/categories
 * 创建分类
 */
router.post("/", async (req, res) => {
  try {
    const { name, description, sortOrder } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
        description,
        sortOrder: sortOrder || 0,
      },
    });
    res.json(category);
  } catch (error) {
    console.error("创建分类失败:", error);
    res.status(500).json({ error: "创建分类失败" });
  }
});

/**
 * PUT /api/categories/:id
 * 更新分类
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sortOrder } = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        sortOrder,
      },
    });
    res.json(category);
  } catch (error) {
    console.error("更新分类失败:", error);
    res.status(500).json({ error: "更新分类失败" });
  }
});

/**
 * DELETE /api/categories/:id
 * 删除分类（软删除）
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 检查是否有菜品使用此分类
    const dishesCount = await prisma.dish.count({
      where: { categoryId: id },
    });

    if (dishesCount > 0) {
      return res.status(400).json({
        error: "无法删除分类，该分类下还有菜品",
      });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
    res.json(category);
  } catch (error) {
    console.error("删除分类失败:", error);
    res.status(500).json({ error: "删除分类失败" });
  }
});

export default router;
