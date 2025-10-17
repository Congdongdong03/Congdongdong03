import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳 + 随机字符串 + 原始扩展名
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制5MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("只允许上传图片文件"));
    }
  },
});

/**
 * POST /api/upload/image
 * 上传图片
 */
router.post("/image", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "没有上传文件",
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: imageUrl, // 只返回相对路径，由前端根据环境拼接完整URL
        filename: req.file.filename,
      },
    });
  } catch (error: any) {
    console.error("上传图片失败:", error);
    res.status(500).json({
      success: false,
      error: error.message || "上传图片失败",
    });
  }
});

export default router;
