// 强制重写 schema.prisma 为 PostgreSQL
const fs = require("fs");
const path = require("path");

console.log("🔧 强制重写 schema.prisma 为 PostgreSQL 配置...");

const schemaPath = path.join(__dirname, "prisma", "schema.prisma");

// 读取当前 schema 内容
let schemaContent = fs.readFileSync(schemaPath, "utf8");

console.log("📄 当前 Schema 内容 (前200字符):");
console.log(schemaContent.substring(0, 200) + "...");

// 强制替换为 PostgreSQL 配置
const postgresqlSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema
// FORCE POSTGRESQL CONFIGURATION - DO NOT CHANGE TO SQLITE

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  openid    String   @unique
  nickname  String
  avatar    String?
  role      String   @default("diner") // "chef" or "diner"
  points    Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  orders        Order[]
  pointsHistory PointsHistory[]
}

model Category {
  id          String @id @default(cuid())
  name        String @unique
  description String?
  sortOrder   Int    @default(0)
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  dishes Dish[]
}

model Dish {
  id          String @id @default(cuid())
  name        String @unique
  description String?
  image       String
  price       Int
  categoryId  String
  sales       Int    @default(0)
  isAvailable Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  category   Category    @relation(fields: [categoryId], references: [id])
  orderItems OrderItem[]
  materials  DishMaterial[]
}

model Order {
  id          String   @id @default(cuid())
  userId      String
  status      String   @default("PENDING") // "PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"
  total       Int
  totalPoints Int      // 订单总积分（前端使用此字段）
  remark      String?  // 订单备注
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user  User        @relation(fields: [userId], references: [id])
  items OrderItem[]
}

model OrderItem {
  id      String @id @default(cuid())
  orderId String
  dishId  String
  name    String
  price   Int
  quantity Int

  order Order @relation(fields: [orderId], references: [id])
  dish  Dish  @relation(fields: [dishId], references: [id])
}

model Inventory {
  id       String   @id @default(cuid())
  name     String   @unique
  quantity Int      @default(0)
  unit     String   @default("个")
  status   String   @default("NORMAL") // "NORMAL", "OUT_OF_STOCK"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  materials DishMaterial[]
}

model PointsHistory {
  id        String   @id @default(cuid())
  userId    String
  amount    Int
  type      String   // "earn", "spend", "reward"
  description String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}

model DishMaterial {
  id     String @id @default(cuid())
  dishId String
  itemId String
  amount Int    @default(1) // 需要的数量

  dish Dish      @relation(fields: [dishId], references: [id])
  item Inventory @relation(fields: [itemId], references: [id])

  @@unique([dishId, itemId])
}

model Settings {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;

// 写入新的 schema
fs.writeFileSync(schemaPath, postgresqlSchema);

console.log("✅ Schema 已强制重写为 PostgreSQL 配置");

// 验证写入的内容
const newContent = fs.readFileSync(schemaPath, "utf8");
if (newContent.includes('provider = "postgresql"')) {
  console.log("✅ 验证成功：Schema 现在使用 PostgreSQL");
} else {
  console.log("❌ 验证失败：Schema 仍然不是 PostgreSQL");
  process.exit(1);
}

console.log("🎉 Schema 强制重写完成！");
