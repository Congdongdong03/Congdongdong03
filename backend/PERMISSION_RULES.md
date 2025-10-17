# 权限规则说明

## 用户角色系统

### 角色类型

- **chef（大厨）**: 拥有管理面板访问权限，可以管理订单、用户、菜品等
- **diner（食客）**: 普通用户，只能浏览菜单、下单、查看个人订单等

---

## 大厨权限规则

### ⚠️ 核心规则：只有昵称是 "Wesley" 的用户才能是大厨

### 规则详情：

1. **新用户注册**

   - 所有新注册的用户默认角色为 `diner`（食客）
   - 默认昵称为 "微信用户"

2. **昵称修改规则**

   - 当用户修改昵称为 "Wesley" 时 → 自动变成 `chef`（大厨）
   - 当用户修改昵称为其他名字时 → 自动变成 `diner`（食客）
   - 即使之前是大厨，只要昵称改成其他的，就会失去大厨权限

3. **当前系统用户**
   - **Wesley** (OpenID: `o9k7x60psm724DLlAw97yYpxskh8`) - 大厨
   - **小美** (OpenID: `diner_openid_001`) - 食客

---

## 管理面板访问控制

### 访问规则

- 只有 `role = "chef"` 的用户才能访问管理面板
- 后端 API 使用 `verifyChefRole` 中间件验证权限
- 前端会检查用户角色，非大厨用户看不到管理面板入口

### 受保护的 API 端点

- `GET /api/orders/all` - 获取所有订单
- `GET /api/users` - 获取所有用户
- `PUT /api/settings/notice` - 更新温馨提示
- 其他需要大厨权限的操作

---

## 技术实现

### 后端代码位置

- **权限中间件**: `backend/src/middleware/auth.ts`
- **用户路由**: `backend/src/routes/users.ts`
- **用户注册**: `backend/src/routes/wechat.ts`

### 关键代码逻辑

#### 更新用户信息时的角色判断

```typescript
// 只有昵称是 "Wesley" 才能是大厨，否则就是食客
const role = nickname === "Wesley" ? "chef" : "diner";

const updateData: any = {
  nickname,
  avatar,
  role, // 每次更新都设置角色
};
```

#### 权限验证中间件

```typescript
export const verifyChefRole = async (req, res, next) => {
  const operatorUserId = req.body.operatorUserId || req.query.operatorUserId;

  const operatorUser = await prisma.user.findUnique({
    where: { id: operatorUserId },
  });

  if (operatorUser.role !== "chef") {
    return res.status(403).json({ error: "需要大厨权限" });
  }

  next();
};
```

---

## 安全注意事项

1. **唯一性**: 系统设计上只能有一个大厨（昵称为"Wesley"的用户）
2. **动态权限**: 权限是动态的，改昵称就会改变角色
3. **OpenID 验证**: 真正的 Wesley 应该使用 OpenID `o9k7x60psm724DLlAw97yYpxskh8`
4. **前后端双重验证**: 前端隐藏入口 + 后端 API 权限验证

---

## 数据库清理

如需清理数据库，确保只保留以下用户：

- Wesley（大厨）- OpenID: `o9k7x60psm724DLlAw97yYpxskh8`
- 小美（食客）- OpenID: `diner_openid_001`

已执行的清理操作（2025-10-17）：

- ✅ 删除了多余用户
- ✅ 确保 Wesley 是唯一的大厨
- ✅ 确保小美是食客角色
