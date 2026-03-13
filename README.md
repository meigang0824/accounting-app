# 🦐 简易记账本

一款安全、简洁的桌面记账应用 - 3 步完成记账，数据本地存储

[![Build Status](https://github.com/your-username/accounting-app/actions/workflows/build.yml/badge.svg)](https://github.com/your-username/accounting-app/actions)
[![Release](https://img.shields.io/github/v/release/your-username/accounting-app)](https://github.com/your-username/accounting-app/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ 特性

- 🔒 **安全可靠** - 通过 19 项安全验证，无 SQL 注入风险
- ⚡ **快速记账** - 全局快捷键 `Ctrl+N`，3 步完成记录
- 📊 **数据统计** - 收支趋势图、分类分布饼图
- 💾 **本地存储** - SQLite 数据库，数据不上传云端
- 🎨 **精美界面** - 深色主题，现代化设计
- 🌐 **跨平台** - 支持 Windows 10/11（macOS 计划中）

---

## 📥 下载安装

### Windows

从 [Releases](https://github.com/your-username/accounting-app/releases) 下载最新安装包：

```
简易记账本 Setup 1.0.1-security.exe
```

运行安装程序，按提示完成安装。

---

## 🚀 快速开始

### 1. 快速记账

- 快捷键：`Ctrl + N`
- 或点击侧边栏 **➕ 快速记账** 按钮

### 2. 填写信息

1. 输入金额（自动聚焦）
2. 选择分类（支出/收入）
3. 可选：添加备注

### 3. 保存

- 点击 **保存** 或按 `Enter`
- 支持 `Ctrl + Enter` 保存并新建

---

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + N` | 新建记录 |
| `Ctrl + F` | 搜索 |
| `Ctrl + ,` | 打开设置 |
| `Enter` | 确认/保存 |
| `Esc` | 取消/关闭 |
| `Delete` | 删除选中项 |

---

## 🛠️ 本地开发

### 环境要求

- Node.js 20+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

### 构建生产版本

```bash
npm run build
```

输出目录：`dist/`

### 运行测试

```bash
# 单元测试
npm test

# E2E 测试
npm run test:e2e

# 安全验证
node verify-security.js
```

---

## 📁 项目结构

```
accounting-app/
├── main.js                 # Electron 主进程（安全加固版）
├── preload.js              # IPC 桥接层
├── index.html              # 渲染进程
├── package.json            # 项目配置
├── verify-security.js      # 安全验证脚本
├── .github/workflows/      # GitHub Actions 配置
│   └── build.yml           # 自动构建流程
├── tests/                  # 测试文件
│   ├── unit/               # 单元测试
│   ├── e2e/                # E2E 测试
│   └── security/           # 安全测试
└── docs/                   # 文档
    ├── LOGGING_GUIDE.md    # 日志系统指南
    └── SECURITY_FIX_REPORT.md  # 安全修复报告
```

---

## 🔒 安全说明

### v1.0.1-security 修复内容

| 问题 | 修复方式 |
|------|----------|
| SQL 注入漏洞 | 参数化查询 |
| Electron 配置风险 | contextIsolation + nodeIntegration |
| 无错误处理 | try-catch + 全局监听 |
| 无日志系统 | electron-log 集成 |

### 安全验证

运行以下命令验证安全性：

```bash
node verify-security.js
```

**19 项安全检查全部通过** ✅

---

## 📋 版本历史

### v1.0.1-security (2026-03-13)

**安全修复版本**

- ✅ 修复 SQL 注入漏洞（3 处 IPC handlers）
- ✅ 启用 Electron 安全配置
- ✅ 添加全局错误处理
- ✅ 集成日志系统
- ✅ 通过 19 项安全验证

### v1.0.0 (2026-03-13)

**初始版本**

- 基础记账功能
- 数据统计图表
- 分类管理

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发计划

- [ ] macOS 支持
- [ ] 数据导出（CSV/Excel）
- [ ] 自动备份
- [ ] 多账本支持
- [ ] 移动端应用

---

## 📞 联系方式

- GitHub Issues: [提交问题](https://github.com/your-username/accounting-app/issues)
- 邮箱：your-email@example.com

---

**Made with ❤️ by 小龙虾科技有限公司**
