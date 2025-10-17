# 🍽️ 微信小程序 - 餐厅菜单点餐系统

一个功能完整的微信小程序餐厅点餐系统，包含前端小程序和后端API服务。

## ✨ 主要功能

### 用户端功能
- 📱 浏览菜品菜单
- 🛒 购物车管理
- 📝 在线下单
- 🎁 积分系统
- 👤 个人中心

### 管理端功能
- 📊 菜品管理（增删改查）
- 📂 分类管理
- 📦 库存管理
- 📋 订单管理
- 🛍️ 采购清单

## 🛠️ 技术栈

### 前端
- **框架**: Taro 3.x（支持多端）
- **UI**: Taro UI
- **语言**: JavaScript/JSX
- **样式**: SCSS

### 后端
- **运行时**: Node.js
- **框架**: Express
- **数据库**: SQLite (Prisma ORM)
- **认证**: 微信小程序登录

## 📁 项目结构

```
my-new-project/
├── src/                    # 前端源码
│   ├── pages/             # 页面
│   ├── components/        # 组件
│   ├── services/          # API服务
│   └── utils/             # 工具函数
├── backend/               # 后端源码
│   ├── src/              # 后端代码
│   │   ├── routes/       # 路由
│   │   ├── services/     # 业务逻辑
│   │   └── middleware/   # 中间件
│   └── prisma/           # 数据库
└── dist/                 # 编译输出

```

## 🚀 快速启动

### 前置要求
- Node.js 14+
- npm 或 yarn
- 微信开发者工具

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
```

### 启动开发服务器

```bash
# 启动前端（开发模式）
npm run dev:weapp

# 启动后端
cd backend
npm run dev
```

### 数据库初始化

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

## 📝 配置说明

### 微信小程序配置
1. 在微信公众平台注册小程序
2. 修改 `project.config.json` 中的 `appid`
3. 配置后端服务器域名

### 后端配置
1. 创建 `backend/.env` 文件
2. 配置必要的环境变量（数据库、微信配置等）

## 📄 许可证

MIT

## 👨‍💻 作者

Wesley

---

💡 如有问题或建议，欢迎提Issue！
