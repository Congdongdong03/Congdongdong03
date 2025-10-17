# 数据库配置指南

## 开发环境与生产环境已统一使用 PostgreSQL

### ✅ 完成状态

本项目已完成开发环境和生产环境的数据库统一配置：

- **开发环境**: PostgreSQL 15 (本地)
- **生产环境**: PostgreSQL (Render.com)
- **已移除**: SQLite 支持（避免数据不一致）

---

## 本地开发环境配置

### 1. 安装 PostgreSQL

```bash
# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15

# 添加到 PATH (可选，但推荐)
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 2. 创建数据库

```bash
createdb menu_miniprogram_dev
```

### 3. 配置环境变量

在 `backend/` 目录创建 `.env` 文件：

```env
DATABASE_URL="postgresql://你的用户名@localhost:5432/menu_miniprogram_dev?schema=public"
NODE_ENV=development
PORT=3001

WECHAT_APP_ID=你的微信小程序AppID
WECHAT_APP_SECRET=你的微信小程序AppSecret
```

**注意**:

- 用户名通常是你的 macOS 用户名
- `.env` 文件已加入 `.gitignore`，不会提交到版本控制

### 4. 运行数据库迁移

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
```

### 5. 初始化测试数据（可选）

```bash
npx ts-node src/seed.ts
```

### 6. 启动开发服务器

```bash
npm run dev
```

---

## 验证配置

### 测试数据库连接

访问: `https://localhost:3001/test-db`

应该看到:

```json
{
  "message": "数据库连接正常",
  "orderCount": 0,
  "recentOrders": []
}
```

### 使用 Prisma Studio 查看数据

```bash
cd backend
npx prisma studio
```

这会在浏览器打开可视化数据库管理界面。

---

## 生产环境配置

生产环境在 Render.com 上部署，配置在 `render.yaml` 中：

1. **数据库**: 在 Render Dashboard 创建 PostgreSQL 数据库
2. **环境变量**: 在 Render 服务设置中添加 `DATABASE_URL`
3. **自动部署**: Push 到 GitHub 后自动触发构建和部署

---

## 常见问题

### Q: 如何查看 PostgreSQL 数据？

```bash
# 连接到数据库
psql -d menu_miniprogram_dev

# 查看所有表
\dt

# 查询用户数据
SELECT * FROM "User";

# 退出
\q
```

### Q: 如何重置数据库？

```bash
cd backend
npx prisma migrate reset --force
npx ts-node src/seed.ts
```

### Q: 开发环境连接不上数据库？

1. 检查 PostgreSQL 服务是否运行:

   ```bash
   brew services list | grep postgresql
   ```

2. 如果没有运行，启动服务:

   ```bash
   brew services start postgresql@15
   ```

3. 检查 `.env` 文件的 `DATABASE_URL` 是否正确

### Q: 如何备份数据？

```bash
pg_dump menu_miniprogram_dev > backup.sql
```

### Q: 如何恢复数据？

```bash
psql -d menu_miniprogram_dev < backup.sql
```

---

## 技术栈

- **ORM**: Prisma 5.7.1
- **数据库**: PostgreSQL 15
- **迁移管理**: Prisma Migrate
- **开发工具**: Prisma Studio

---

## 相关文件

- `prisma/schema.prisma` - 数据库模型定义
- `prisma/migrations/` - 数据库迁移历史
- `.env` - 本地环境变量配置（不提交到 Git）
- `.env.example` - 环境变量配置模板
- `src/seed.ts` - 测试数据种子脚本

---

## 注意事项

⚠️ **重要**:

- 本项目已移除 SQLite 支持，必须配置 PostgreSQL 才能运行
- `.env` 文件包含敏感信息，绝不要提交到版本控制
- 生产环境和开发环境使用相同的数据库模式，确保一致性
