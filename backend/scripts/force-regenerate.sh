#!/bin/bash

echo "🧹 强制清理 Prisma 缓存..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

echo "🔄 重新生成 Prisma Client..."
npx prisma generate

echo "🏗️ 重新构建项目..."
yarn build

echo "✅ 完成！"
