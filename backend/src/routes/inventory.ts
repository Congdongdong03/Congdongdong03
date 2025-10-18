import express from "express";
import prisma from "../db/prisma";

const router = express.Router();

/**
 * GET /api/inventory
 * 获取库存列表
 */
router.get("/", async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: { name: "asc" },
    });
    res.json(inventory);
  } catch (error) {
    console.error("获取库存失败:", error);
    res.status(500).json({ error: "获取库存失败" });
  }
});

/**
 * GET /api/inventory/all
 * 获取所有库存（包括已删除）
 */
router.get("/all", async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: { name: "asc" },
    });
    res.json(inventory);
  } catch (error) {
    console.error("获取所有库存失败:", error);
    res.status(500).json({ error: "获取所有库存失败" });
  }
});

/**
 * POST /api/inventory
 * 添加库存项
 */
router.post("/", async (req, res) => {
  try {
    const { name, quantity, unit } = req.body;

    const item = await prisma.inventory.create({
      data: {
        name,
        quantity,
        unit,
        status: quantity > 0 ? "NORMAL" : "OUT_OF_STOCK",
      },
    });

    res.json(item);
  } catch (error) {
    console.error("添加库存项失败:", error);
    res.status(500).json({ error: "添加库存项失败" });
  }
});

/**
 * PUT /api/inventory/:id
 * 更新库存项
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const item = await prisma.inventory.update({
      where: { id },
      data: {
        quantity,
        status: quantity > 0 ? "NORMAL" : "OUT_OF_STOCK",
      },
    });

    res.json(item);
  } catch (error) {
    console.error("更新库存项失败:", error);
    res.status(500).json({ error: "更新库存项失败" });
  }
});

/**
 * DELETE /api/inventory/:id
 * 删除库存项
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.inventory.delete({
      where: { id },
    });

    res.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除库存项失败:", error);
    res.status(500).json({ error: "删除库存项失败" });
  }
});

export default router;
