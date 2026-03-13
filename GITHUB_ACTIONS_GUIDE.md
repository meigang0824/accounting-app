# GitHub Actions 构建指南

## 📋 前置条件

1. **项目已托管到 GitHub**
   - 如果还没有，创建 GitHub 仓库并推送代码

2. **GitHub 账号**
   - 需要有权限创建 Release

---

## 🚀 使用方式

### 方式 1：推送 Tag 自动构建（推荐）

```powershell
# 1. 提交代码
git add .
git commit -m "chore: release v1.0.1-security"

# 2. 打标签
git tag v1.0.1-security

# 3. 推送标签到 GitHub
git push origin v1.0.1-security
```

推送后，GitHub Actions 会自动触发构建，约 10-15 分钟后：
- ✅ 构建完成
- ✅ 安装包自动上传到 Release
- ✅ 可在 Releases 页面下载

### 方式 2：手动触发构建

1. 进入 GitHub 仓库 → **Actions** 标签
2. 选择 **"Build and Release"** workflow
3. 点击 **"Run workflow"**
4. 选择分支（main/master）
5. 点击 **"Run workflow"** 按钮

---

## 📦 构建产物

### 输出文件

| 文件 | 说明 |
|------|------|
| `简易记账本 Setup 1.0.1-security.exe` | Windows 安装程序（NSIS） |
| `win-unpacked/` | 解压版（可选） |

### 下载位置

- **自动发布：** GitHub Releases 页面
  `https://github.com/你的用户名/你的仓库/releases`

- **手动下载：** Actions → 对应构建 → Artifacts

---

## 🔧 配置说明

### Workflow 文件位置

```
.github/workflows/build.yml
```

### 构建环境

- **Runner:** `windows-latest` (Windows Server 2022)
- **Node.js:** 20.x
- **包含:** Visual Studio Build Tools（已预装）

### 触发条件

| 事件 | 说明 |
|------|------|
| `push: tags: 'v*'` | 推送 v* 格式的标签时自动构建 |
| `workflow_dispatch` | 手动触发构建 |

---

## 📝 发布流程

### 完整发布步骤

```powershell
# 1. 更新版本号（package.json）
# 已更新为 1.0.1-security

# 2. 提交更改
git add .
git commit -m "release: v1.0.1-security - 安全修复版本"

# 3. 打标签
git tag v1.0.1-security

# 4. 推送
git push origin main
git push origin v1.0.1-security
```

### 等待构建完成

1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 查看构建进度（约 10-15 分钟）
4. 完成后在 **Releases** 下载安装包

---

## 🔐 安全验证

构建前会自动运行 `verify-security.js`，确保：
- ✅ 19 项安全检查全部通过
- ✅ SQL 注入已修复
- ✅ Electron 安全配置正确

---

## ⚠️ 常见问题

### Q: 构建失败怎么办？

**查看日志：**
1. Actions → 失败的构建
2. 点击具体 job
3. 展开日志查看错误信息

**常见原因：**
- 依赖安装失败 → 检查 npm 源
- 构建超时 → 重试即可
- 签名失败 → 无需签名，忽略

### Q: 如何自定义构建配置？

编辑 `.github/workflows/build.yml`：
- 修改 `node-version` 改变 Node 版本
- 修改 `runs-on` 改变操作系统
- 添加更多构建步骤

### Q: 如何发布到多个平台？

参考 `build.yml` 添加 macOS/Linux job：
```yaml
build-macos:
  runs-on: macos-latest
  # ... 类似配置
```

---

## 📊 构建时间预估

| 步骤 | 预计时间 |
|------|----------|
| Checkout | 30 秒 |
| Setup Node.js | 30 秒 |
| Install dependencies | 3-5 分钟 |
| Security verification | 10 秒 |
| Build | 5-8 分钟 |
| Upload artifacts | 1-2 分钟 |
| **总计** | **10-15 分钟** |

---

## 🎯 下一步

1. **推送代码到 GitHub**
2. **推送标签 v1.0.1-security**
3. **等待构建完成**
4. **下载并测试安装包**

---

**构建配置已就绪，随时可以开始！** 🚀
