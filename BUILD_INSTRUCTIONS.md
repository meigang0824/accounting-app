# 构建指南 - 简易记账本 v1.0.1-security

## 🛠️ 构建环境要求

### 必需软件

1. **Node.js** v20.0.0 或更高版本
   - 推荐版本：v24.13.0（当前开发环境）
   - 下载地址：https://nodejs.org/

2. **Visual Studio Build Tools 2022**
   - 下载地址：https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - 安装时必须选择 **"Desktop development with C++"** 工作负载
   - 或安装完整的 Visual Studio 2022（Community/Professional/Enterprise）

3. **npm** v9.0.0 或更高版本
   - 随 Node.js 一起安装

### 可选软件

- **Git** - 版本控制
- **7-Zip** - 解压工具

---

## 📦 构建步骤

### 步骤 1：克隆/进入项目目录

```bash
cd C:\Users\mayn\.openclaw\workspace\accounting-app
```

### 步骤 2：安装依赖

```bash
npm install
```

**预期输出：**
```
added XXX packages in XXs
XX packages are looking for funding
```

### 步骤 3：验证安全修复（可选但推荐）

```bash
node verify-security.js
```

**预期输出：**
```
🔍 开始验证 P0 安全修复...
==================================================
验证完成：19 项
✅ 通过：19
❌ 失败：0
==================================================
🎉 所有 P0 安全修复已验证通过！
```

### 步骤 4：运行测试（可选但推荐）

```bash
# 单元测试
npm run test:unit

# E2E 测试
npm run test:e2e

# 全部测试
npm run test:all
```

### 步骤 5：构建安装包

```bash
npm run build
```

**或使用 electron-builder 直接构建：**
```bash
npx electron-builder --win --x64
```

**预期输出：**
```
• electron-builder  version=26.8.1
• loaded configuration  file=package.json
• executing @electron/rebuild  electronVersion=41.0.0
• installing native dependencies  arch=x64
• preparing       moduleName=better-sqlite3 arch=x64
• building        platform=win32 arch=x64
• packaging       platform=win32 arch=x64
• building NSIS installer
• building zip for portable version
✓ Build complete: dist/
```

---

## 📁 构建输出

构建完成后，`dist/` 目录将包含以下文件：

```
dist/
├── 简易记账本 Setup 1.0.1-security.exe    # NSIS 安装程序 (~50MB)
├── 简易记账本-1.0.1-security-win.zip      # 便携版 (~45MB)
├── 简易记账本-1.0.1-security-win-x64.exe  # 免安装版
└── builder-effective-config.yaml         # 构建配置
```

### 安装包说明

| 文件 | 类型 | 大小 | 用途 |
|------|------|------|------|
| Setup .exe | NSIS 安装程序 | ~50MB | 推荐，带卸载程序 |
| .zip | 压缩包 | ~45MB | 便携版，解压即用 |
| .exe (win-x64) | 单文件 | ~45MB | 免安装版 |

---

## 🔧 常见问题

### 问题 1：node-gyp 编译失败

**错误信息：**
```
Error: Could not find any Visual Studio installation to use
```

**解决方案：**
1. 安装 Visual Studio Build Tools 2022
2. 确保安装时选择了 "Desktop development with C++" 工作负载
3. 重启终端后重新运行 `npm install`

### 问题 2：better-sqlite3 预编译下载超时

**错误信息：**
```
prebuild-install warn install Request timed out
```

**解决方案：**
1. 检查网络连接
2. 使用国内镜像：
   ```bash
   npm config set registry https://registry.npmmirror.com
   npm install
   ```
3. 或手动下载预编译文件（如可用）

### 问题 3：electron-builder 找不到

**错误信息：**
```
'electron-builder' 不是内部或外部命令
```

**解决方案：**
```bash
# 使用 npx 运行
npx electron-builder

# 或全局安装
npm install -g electron-builder
```

### 问题 4：构建输出目录为空

**可能原因：**
- 构建过程中断
- 磁盘空间不足
- 权限问题

**解决方案：**
1. 清理构建缓存：
   ```bash
   rm -rf dist/ node_modules/.cache/
   ```
2. 重新安装依赖：
   ```bash
   npm install
   ```
3. 重新构建：
   ```bash
   npm run build
   ```

---

## 🚀 快速构建（已配置环境）

如果开发环境已完全配置，可使用以下一键构建命令：

```powershell
Set-Location C:\Users\mayn\.openclaw\workspace\accounting-app
npm install
node verify-security.js
npm run build
```

---

## 📝 构建配置说明

构建配置位于 `package.json` 的 `build` 字段：

```json
{
  "build": {
    "appId": "com.accounting.app",
    "productName": "简易记账本",
    "win": {
      "target": "nsis",
      "icon": "icon.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true
    }
  }
}
```

### 配置说明

- **appId:** 应用唯一标识符
- **productName:** 应用显示名称
- **win.target:** Windows 打包目标（nsis = 安装程序）
- **nsis.oneClick:** false = 允许用户选择安装目录
- **nsis.createDesktopShortcut:** true = 创建桌面快捷方式

---

## 🔐 代码签名（可选）

如需对安装包进行代码签名：

1. 获取代码签名证书（.pfx 文件）
2. 配置 `package.json`：

```json
{
  "build": {
    "win": {
      "sign": "./sign.js",
      "certificateFile": "certificate.pfx",
      "certificatePassword": "your-password"
    }
  }
}
```

---

## 📊 构建性能参考

| 阶段 | 耗时 | 备注 |
|------|------|------|
| npm install | 30-60 秒 | 首次安装较慢 |
| verify-security.js | < 1 秒 | 快速验证 |
| npm test | 2-5 分钟 | 包含 E2E 测试 |
| npm run build | 2-3 分钟 | 含原生模块编译 |

**总耗时：** 约 5-10 分钟（首次构建）

---

*最后更新：2026-03-13*
