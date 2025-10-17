# HTTPS 配置说明

## 问题解决

✅ **图片上传空白问题已解决**

### 原因分析

1. **URL 格式错误**：图片 URL 出现重复拼接 `http://localhost:3001http://localhost:3001/...`
2. **HTTP 协议不支持**：微信小程序不再支持 HTTP 协议的图片链接，只支持 HTTPS

### 解决方案

已配置 HTTPS 服务器，完全解决图片显示问题。

## 配置详情

### 1. SSL 证书

- 位置：`backend/ssl/`
- 文件：`cert.pem`（证书）、`key.pem`（私钥）
- 类型：自签名证书，有效期 365 天

### 2. 服务器配置

- 协议：HTTPS
- 端口：3001
- 地址：`https://localhost:3001`

### 3. API 地址更新

- 前端 API 基础 URL：`https://localhost:3001/api`
- 图片上传返回 HTTPS URL
- 修复了 URL 重复拼接问题

## 使用方法

### 启动后端服务器

```bash
cd backend
npm start
```

### 启动前端开发

```bash
npm run dev:weapp
```

## 注意事项

### 浏览器安全警告

由于使用自签名证书，浏览器会显示安全警告：

1. 点击"高级"
2. 选择"继续访问 localhost（不安全）"

### 微信开发者工具

1. 在微信开发者工具中，需要信任自签名证书
2. 设置 → 项目设置 → 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书

## 验证方法

### 1. 检查服务器状态

```bash
curl -k https://localhost:3001/
```

应该返回：`{"message":"菜单小程序后端服务运行中"}`

### 2. 测试图片上传

在添加菜品页面：

1. 选择图片
2. 上传成功后，图片应该正常显示
3. 控制台不再出现 HTTP 协议警告

## 生产环境建议

对于生产环境，建议：

1. 使用正式的 SSL 证书（Let's Encrypt 等）
2. 配置域名和 CDN
3. 使用微信云存储或第三方图片服务

## 故障排除

如果遇到问题：

1. 确认 SSL 证书文件存在：`backend/ssl/cert.pem` 和 `backend/ssl/key.pem`
2. 检查端口 3001 是否被占用
3. 确认防火墙允许 HTTPS 连接
4. 重启服务器：`npm start`
