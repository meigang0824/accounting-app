# 记账桌面应用 - 测试指南

## 快速开始

### 安装依赖

```bash
cd accounting-app
npm install
```

### 运行测试

```bash
# 运行所有单元测试
npm test

# 运行单元测试（带覆盖率）
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e

# 运行 E2E 测试（有头模式，可以看到浏览器）
npm run test:e2e:headed

# 运行所有测试
npm run test:all
```

## 测试结构

```
accounting-app/
├── tests/
│   ├── unit/                    # 单元测试
│   │   ├── transaction-service.test.js
│   │   ├── category-service.test.js
│   │   ├── statistics-service.test.js
│   │   └── validation.test.js
│   └── integration/             # 集成测试
│       └── api.test.js
├── e2e/                         # E2E 测试
│   ├── quick-add.test.js
│   ├── data-filter.test.js
│   └── statistics.test.js
├── performance/                 # 性能测试
│   ├── load-test.js
│   └── bulk-data-test.js
├── src/
│   ├── services/                # 业务服务
│   └── utils/                   # 工具函数
├── vitest.config.js             # Vitest 配置
├── playwright.config.js         # Playwright 配置
└── package.json
```

## 测试框架

### 单元测试 - Vitest

- **框架**: Vitest (与 Vite 兼容的测试框架)
- **断言库**: 内置 expect
- **覆盖率**: v8

运行单元测试:
```bash
npm run test:unit
```

### E2E 测试 - Playwright

- **框架**: Playwright
- **浏览器**: Chromium, WebKit
- **报告**: HTML

运行 E2E 测试:
```bash
npm run test:e2e
```

查看 HTML 报告:
```bash
npx playwright show-report
```

### 性能测试 - k6

- **工具**: k6
- **指标**: 响应时间、错误率、吞吐量

运行性能测试:
```bash
k6 run performance/load-test.js
```

## 测试覆盖目标

| 模块 | 行覆盖率 | 分支覆盖率 | 函数覆盖率 |
|------|----------|------------|------------|
| services/ | > 85% | > 80% | > 90% |
| utils/ | > 90% | > 85% | > 95% |
| **总计** | **> 80%** | **> 75%** | **> 85%** |

## 编写测试

### 单元测试示例

```javascript
import { describe, it, expect } from 'vitest';
import { TransactionService } from '../src/services/transaction-service';

describe('TransactionService', () => {
  it('应该成功创建记录', () => {
    const service = new TransactionService(db);
    const result = service.create({
      type: 'expense',
      amount: 50,
      category: '餐饮',
      date: '2026-03-13'
    });
    
    expect(result.id).toBeGreaterThan(0);
  });
});
```

### E2E 测试示例

```javascript
import { test, expect } from '@playwright/test';

test('添加支出记录', async ({ page }) => {
  await page.goto('index.html');
  
  await page.fill('#amount', '50');
  await page.selectOption('#category', '餐饮');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.record-item'))
    .toContainText('餐饮');
});
```

## 性能基准

| 指标 | 目标值 | 命令 |
|------|--------|------|
| 冷启动时间 | < 3s | `npm run test:perf:startup` |
| 1000 条数据加载 | < 500ms | `node performance/bulk-data-test.js` |
| API 响应时间 (P95) | < 500ms | `k6 run performance/load-test.js` |

## 调试测试

### 调试单元测试

```bash
# 监听模式
npx vitest --watch

# 运行特定测试文件
npx vitest tests/unit/transaction-service.test.js

# 调试模式
npx vitest --inspect-brk
```

### 调试 E2E 测试

```bash
# 有头模式
npx playwright test --headed

# 调试模式
npx playwright test --debug

# 单步执行
npx playwright test --trace on
```

## 持续集成

### GitHub Actions 示例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 常见问题

### Q: 测试失败怎么办？

A: 查看错误信息，确认是测试代码问题还是功能问题。使用 `--watch` 模式快速迭代。

### Q: 如何跳过某个测试？

A: 使用 `.skip`:
```javascript
it.skip('暂时跳过的测试', () => {
  // ...
});
```

### Q: 如何只运行失败的测试？

A: Vitest 支持:
```bash
npx vitest --failed
```

### Q: Playwright 浏览器安装失败？

A: 运行:
```bash
npx playwright install --with-deps
```

## 参考文档

- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [k6 文档](https://k6.io/docs/)
- [完整测试计划](../TEST-PLAN-BOOKKEEPING-APP.md)
