# Overwatch Workshop Hub

一个基于 Nuxt 3、PostgreSQL、Prisma、Tailwind CSS 的守望先锋工坊代码收集社区第一版实现。

## 已实现

- 中英双语、亮暗色、响应式毛玻璃 UI。
- 邮箱验证码注册、登录、HttpOnly Cookie Session。
- 工坊代码上传、公开分页列表、详情页、安全 Markdown 渲染。
- 源氏跑酷专区 `/genji-pk` 和专用上传页。
- 上传默认 `PENDING`，后台审核通过后才公开。
- 管理后台：概览、用户封禁、内容审核、内容隐藏/恢复、举报处理、标签和审计日志。
- Prisma PostgreSQL 数据模型、索引、软删除状态和管理员初始化 seed。

## 启动

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

本地访问 `http://localhost:3000`。

## 环境变量

见 `.env.example`。至少需要：

- `DATABASE_URL`
- `SESSION_SECRET`
- `INITIAL_ADMIN_EMAIL`

SMTP 使用 `nodemailer` 发送邮箱验证码。如果没有配置 `SMTP_HOST`，验证码会输出到服务端控制台，便于本地开发。

## 管理员初始化

设置：

```env
INITIAL_ADMIN_EMAIL="admin@example.com"
INITIAL_ADMIN_PASSWORD="ChangeMe12345"
```

执行：

```bash
npm run db:seed
```

也可以让 `INITIAL_ADMIN_EMAIL` 指定的邮箱首次注册时自动成为 `ADMIN`。

## 数据库迁移

```bash
npm run db:migrate
npm run db:generate
```

## 测试与代码质量

```bash
npm run lint
npm run test
npm run build
```

## 自动化部署

复制并填写部署配置：

```bash
cp .env.deploy.example .env.deploy
```

执行：

```bash
npm run deploy
```

部署脚本会本地执行 Nuxt 构建，打包 `.output`、`package.json`、`package-lock.json`、`prisma` 和 `prisma.config.ts`，通过 SSH/SCP 上传到服务器，在远端创建缺失的 PostgreSQL 用户/数据库，执行依赖安装、`prisma generate`、`prisma migrate deploy` 和管理员 seed，然后用 PM2 从 `current` 目录启动应用。默认监听端口是 `3001`，可用 `.env.deploy` 的 `APP_PORT` 修改。

数据库密码放在 `.env.deploy` 的 `DB_PASSWORD`。部署脚本会把它写入远端 `shared/.env` 的 `DATABASE_URL`，不会打印到终端。`SITE_PASSWORD` 会作为 `INITIAL_ADMIN_EMAIL` 对应后台管理员账号的密码；`SESSION_SECRET` 如未配置会由部署脚本自动生成。

## 安全说明

- 密码使用 bcrypt 哈希。
- 验证码只保存 SHA-256 hash，并有 10 分钟有效期。
- 登录、验证码、上传、举报接口有内存限流。生产环境建议换 Redis。
- 管理接口全部服务端鉴权，`MODERATOR` 可审核，`ADMIN` 可管理用户和标签。
- Markdown 通过 `markdown-it` 渲染，并使用 `sanitize-html` 清洗。
