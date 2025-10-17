# 菜单小程序后端服务

完整的后端 API 服务，支持菜单管理、订单系统、积分系统、库存管理等功能。

## 🚀 快速开始

### 1. 配置数据库

**重要**: 本项目使用 PostgreSQL（开发环境和生产环境统一）

详细配置步骤请查看: [DATABASE_SETUP.md](./DATABASE_SETUP.md)

快速配置：

```bash
# 安装 PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# 创建数据库
createdb menu_miniprogram_dev

# 配置环境变量（复制 .env.example 并修改）
cp .env.example .env
# 编辑 .env 文件，设置 DATABASE_URL
```

### 2. 安装依赖

```bash
npm install
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate deploy

# 初始化种子数据
npx ts-node src/seed.ts
```

### 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

服务将在 `http://localhost:3001` 运行

## 📚 API 文档

### 基础信息

- **Base URL**: `http://localhost:3001/api`
- **权限验证**: 宽松模式（开发环境允许跳过验证）

### 测试账号

- **Chef 账号**: `openid: o9k7x60psm724DLlAw97yYpxskh8`, 积分: 10000
- **用户账号**: `openid: diner_openid_001`, 积分: 5000

---

## 1. 分类管理 (4 个端点)

### 获取所有分类

```
GET /api/categories
```

### 创建分类

```
POST /api/categories
Body: { name, description?, sortOrder? }
```

### 更新分类

```
PUT /api/categories/:id
Body: { name, description, sortOrder }
```

### 删除分类

```
DELETE /api/categories/:id
```

---

## 2. 菜品管理 (7 个端点)

### 获取所有菜品

```
GET /api/dishes
```

### 获取单个菜品

```
GET /api/dishes/:id
```

### 创建菜品

```
POST /api/dishes
Body: { name, description?, image?, price, categoryId }
```

### 更新菜品

```
PUT /api/dishes/:id
Body: { name, description, image, price, categoryId }
```

### 删除菜品（软删除）

```
DELETE /api/dishes/:id
```

### 获取菜品原材料

```
GET /api/dishes/:id/materials
Response: [{ id, dishId, itemId, amount, item: {...} }]
```

### 添加菜品原材料

```
POST /api/dishes/:id/materials
Body: { itemId, amount }
```

### 删除菜品原材料

```
DELETE /api/dishes/:id/materials/:materialId
```

---

## 3. 用户管理 (3 个端点)

### 根据 openid 获取用户

```
GET /api/users/:openid
Response: { id, openid, nickname, avatar, role, points }
```

### 获取所有用户（需 Chef 权限）

```
GET /api/users?userId=xxx
```

### 更新用户信息

```
PUT /api/users/:openid
Body: { nickname, avatar }
```

---

## 4. 订单管理 (5 个端点)

### 获取用户订单

```
GET /api/orders/:userId
Response: [{ id, userId, status, totalPoints, remark, items: [...] }]
```

### 获取所有订单（需 Chef 权限）

```
GET /api/orders/all?userId=xxx
```

### 创建订单

```
POST /api/orders
Body: {
  userId,
  items: [{ dishId, name, price, quantity }],
  totalPoints,
  remark?
}
```

**注意**: 创建订单会自动扣除用户积分并记录积分历史

### 更新订单状态

```
PUT /api/orders/:id/status
Body: { status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" }
```

### 取消订单

```
DELETE /api/orders/:id
```

**注意**: 只能取消 PENDING 状态的订单，会自动退还积分

---

## 5. 库存管理 (6 个端点)

### 获取库存列表

```
GET /api/inventory
```

### 获取所有库存

```
GET /api/inventory/all
```

### 添加库存项

```
POST /api/inventory
Body: { name, quantity, unit }
```

### 更新库存

```
PUT /api/inventory/:id
Body: { quantity }
```

### 删除库存项

```
DELETE /api/inventory/:id
```

### 获取购物清单

```
GET /api/shopping-list
Response: 库存不足（quantity <= 5）的项目列表
```

---

## 6. 积分系统 (3 个端点)

### 奖励积分（需 Chef 权限）

```
POST /api/points/reward
Body: { userId, amount, description? }
```

### 扣减积分（需 Chef 权限）

```
POST /api/points/deduct
Body: { userId, amount, description? }
```

### 获取积分历史

```
GET /api/points/history/:userId
Response: [{ id, userId, amount, type, description, createdAt }]
```

---

## 7. 微信登录 (1 个端点)

### 获取 OpenID

```
GET /api/wechat/get-openid?code=xxx
Response: { openid, session_key?, user: {...} }
```

**注意**: 首次登录会自动创建用户，初始积分 100

---

## 8. 系统设置 (2 个端点)

### 获取温馨提示

```
GET /api/settings/notice
Response: { key: "notice", value: "..." }
```

### 更新温馨提示（需 Chef 权限）

```
PUT /api/settings/notice
Body: { noticeText, userId }
```

---

## 9. 文件上传 (1 个端点)

### 上传图片

```
POST /api/upload/image
Content-Type: multipart/form-data
Field: image (file)

Response: {
  success: true,
  data: {
    url: "http://localhost:3001/uploads/xxx.jpg",
    filename: "xxx.jpg"
  }
}
```

---

## 🔐 权限系统

### Chef 权限要求的端点

- `GET /api/users` - 获取所有用户
- `GET /api/orders/all` - 获取所有订单
- `POST /api/points/reward` - 奖励积分
- `POST /api/points/deduct` - 扣减积分
- `PUT /api/settings/notice` - 更新温馨提示

### 权限验证方式

在请求中传递 `userId` 或 `operatorUserId` 参数：

- Query 参数: `?userId=xxx`
- Body 参数: `{ userId: "xxx" }` 或 `{ operatorUserId: "xxx" }`

开发模式下，如果未提供 userId，验证会自动通过。

---

## 📦 数据库管理

### 常用命令

```bash
# 查看数据库
npm run db:studio

# 重置数据库
npm run db:reset

# 生成 Prisma Client
npm run db:generate
```

---

## 🎯 核心业务逻辑

### 订单创建流程

1. 验证用户积分是否足够
2. 扣除用户积分
3. 创建订单记录（包含 totalPoints 和 remark）
4. 记录积分历史（type: "spend"）
5. 返回订单信息

### 订单取消流程

1. 检查订单状态（只能取消 PENDING）
2. 退还用户积分
3. 更新订单状态为 CANCELLED
4. 记录积分历史（type: "refund"）
5. 返回结果

### 购物清单生成

- 筛选 `quantity <= 5` 的库存项
- 建议采购数量为 20
- 按库存数量升序排列

---

## 🛠️ 技术栈

- **框架**: Express.js + TypeScript
- **数据库**: SQLite + Prisma ORM
- **文件上传**: Multer
- **HTTP 客户端**: Axios

---

## 📝 数据模型

### Order（订单）

```typescript
{
  id: string,
  userId: string,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  total: number,
  totalPoints: number,  // ⚠️ 前端使用此字段
  remark: string?,      // ⚠️ 订单备注
  createdAt: string,
  updatedAt: string
}
```

### User（用户）

```typescript
{
  id: string,
  openid: string,
  nickname: string,
  avatar: string?,
  role: "chef" | "diner",
  points: number
}
```

### DishMaterial（菜品原材料）

```typescript
{
  id: string,
  dishId: string,
  itemId: string,      // ⚠️ 库存ID
  amount: number,
  item: Inventory      // ⚠️ 关联的库存对象
}
```

---

## ✅ 完成状态

后端服务已完整实现前端所需的所有 31 个 API 端点：

- ✅ 微信登录
- ✅ 用户管理
- ✅ 分类管理
- ✅ 菜品管理（含原材料关联）
- ✅ 订单管理（含积分逻辑）
- ✅ 库存管理（含购物清单）
- ✅ 积分系统（奖励、扣减、历史）
- ✅ 系统设置
- ✅ 文件上传

所有字段名称严格匹配前端期望！
