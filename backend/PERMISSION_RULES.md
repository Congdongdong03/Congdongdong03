# 权限规则说明

## 用户角色系统

### 角色类型

- **chef（大厨）**: 拥有管理面板访问权限，可以管理订单、用户、菜品等
- **diner（食客）**: 普通用户，只能浏览菜单、下单、查看个人订单等

---

## 大厨权限规则

### 🔧 新的权限规则：基于数据库角色管理

### 规则详情：

1. **新用户注册**

   - 所有新注册的用户默认角色为 `diner`（食客）
   - 默认昵称为 "微信用户"

2. **角色管理**

   - 用户角色由管理员通过 `/api/admin/users/:openid/role` API 手动设置
   - 不再基于昵称自动设置角色
   - 角色变更需要管理员权限

3. **当前系统用户**
   - 所有用户默认角色为 `diner`（食客）
   - 需要管理员手动设置大厨角色

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

#### 更新用户信息时的角色保持

```typescript
// 不再强制设置角色，保持用户原有角色
const updateData: any = {
  nickname,
  avatar,
  // 移除强制角色设置，让用户保持原有角色
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

1. **角色管理**: 用户角色由管理员手动设置，不再自动变更
2. **权限验证**: 基于数据库中的角色字段进行验证
3. **管理员权限**: 只有管理员可以设置用户角色
4. **前后端双重验证**: 前端隐藏入口 + 后端 API 权限验证

---

## 数据库清理

如需清理数据库，所有用户默认角色为食客：

- 所有用户默认角色为 `diner`（食客）
- 需要管理员手动设置大厨角色
- 使用 `/api/admin/users/:openid/role` API 设置角色

已执行的清理操作（2025-10-17）：

- ✅ 移除了所有硬编码的角色设置
- ✅ 所有用户默认角色为食客
- ✅ 角色管理改为手动设置
