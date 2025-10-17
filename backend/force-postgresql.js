// 强制 PostgreSQL 配置验证脚本
const fs = require("fs");
const path = require("path");

console.log("🔍 检查 Prisma Schema 配置...");

const schemaPath = path.join(__dirname, "prisma", "schema.prisma");
const schemaContent = fs.readFileSync(schemaPath, "utf8");

console.log("📄 Schema 内容:");
console.log(schemaContent.substring(0, 200) + "...");

// 检查是否包含 PostgreSQL 配置
if (schemaContent.includes('provider = "postgresql"')) {
  console.log("✅ Schema 配置正确：使用 PostgreSQL");
} else if (schemaContent.includes('provider = "sqlite"')) {
  console.log("❌ Schema 配置错误：仍在使用 SQLite");
  process.exit(1);
} else {
  console.log("⚠️  Schema 配置未知");
}

// 检查环境变量
console.log("🔍 检查环境变量...");
console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL
    ? process.env.DATABASE_URL.substring(0, 20) + "..."
    : "未设置"
);

if (
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL.startsWith("postgresql://")
) {
  console.log("✅ DATABASE_URL 配置正确：PostgreSQL 格式");
} else {
  console.log("❌ DATABASE_URL 配置错误：不是 PostgreSQL 格式");
  process.exit(1);
}

console.log("🎉 所有配置检查通过！");
