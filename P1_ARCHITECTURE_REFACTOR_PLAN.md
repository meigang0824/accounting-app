# 🏗️ 记账桌面应用 - P1 架构重构方案

**负责人**: 前端工程师 (work_c)  
**创建日期**: 2026-03-13  
**预计完成**: 2026-03-27 (2 周)  
**版本**: v2.0.0

---

## 📋 重构目标

### 核心目标
1. ✅ **引入 TypeScript** - 全面类型安全
2. ✅ **架构模块化** - 按功能拆分代码
3. ✅ **统一技术栈** - React + TypeScript
4. ✅ **集成测试** - 测试覆盖生产代码

### 成功指标
- TypeScript 覆盖率: 100%
- 单元测试覆盖率: >80%
- 代码行数/文件: <300 行
- 构建时间: <30 秒

---

## 📁 重构后项目结构

```
accounting-app/
├── package.json
├── tsconfig.json              # TypeScript 配置
├── vite.config.ts             # Vite 构建配置
├── electron-builder.yml       # Electron 打包配置
├── .eslintrc.js               # ESLint 配置
├── .prettierrc                # Prettier 配置
│
├── src/
│   ├── main/                  # 主进程代码
│   │   ├── index.ts           # 主进程入口
│   │   ├── window.ts          # 窗口管理
│   │   ├── database.ts        # 数据库管理
│   │   ├── ipc/               # IPC 处理器
│   │   │   ├── index.ts       # IPC 注册
│   │   │   ├── record.ts      # 记录相关
│   │   │   ├── category.ts    # 分类相关
│   │   │   └── statistics.ts  # 统计相关
│   │   └── utils/             # 主进程工具
│   │       └── logger.ts      # 日志工具
│   │
│   ├── preload/               # Preload 脚本
│   │   └── index.ts           # 安全的 API 桥接
│   │
│   ├── renderer/              # 渲染进程 (React)
│   │   ├── index.tsx          # 渲染进程入口
│   │   ├── App.tsx            # 根组件
│   │   ├── index.html         # HTML 模板
│   │   │
│   │   ├── components/        # 可复用组件
│   │   │   ├── common/        # 通用组件
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── Select.tsx
│   │   │   ├── layout/        # 布局组件
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Summary.tsx
│   │   │   │   └── MainContent.tsx
│   │   │   └── record/        # 记录相关
│   │   │       ├── RecordForm.tsx
│   │   │       ├── RecordList.tsx
│   │   │       └── RecordItem.tsx
│   │   │
│   │   ├── pages/             # 页面组件
│   │   │   └── Dashboard.tsx
│   │   │
│   │   ├── hooks/             # 自定义 Hooks
│   │   │   ├── useRecords.ts
│   │   │   ├── useCategories.ts
│   │   │   ├── useStatistics.ts
│   │   │   └── useNotification.ts
│   │   │
│   │   ├── stores/            # 状态管理 (Zustand)
│   │   │   ├── recordStore.ts
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── services/          # API 服务层
│   │   │   ├── api.ts         # API 客户端
│   │   │   ├── recordService.ts
│   │   │   ├── categoryService.ts
│   │   │   └── statisticsService.ts
│   │   │
│   │   ├── types/             # TypeScript 类型
│   │   │   ├── record.ts
│   │   │   ├── category.ts
│   │   │   └── api.ts
│   │   │
│   │   ├── utils/             # 工具函数
│   │   │   ├── format.ts      # 格式化函数
│   │   │   └── validation.ts  # 验证函数
│   │   │
│   │   └── styles/            # 样式文件
│   │       ├── globals.css    # 全局样式
│   │       └── variables.css  # CSS 变量
│   │
│   └── shared/                # 共享代码
│       ├── types.ts           # 共享类型
│       └── constants.ts       # 共享常量
│
├── tests/                     # 测试代码
│   ├── unit/                  # 单元测试
│   │   ├── main/              # 主进程测试
│   │   └── renderer/          # 渲染进程测试
│   ├── integration/           # 集成测试
│   └── e2e/                   # E2E 测试
│
├── resources/                 # 静态资源
│   ├── icon.png
│   └── ...
│
└── docs/                      # 文档
    ├── API.md
    └── ARCHITECTURE.md
```

---

## 🔧 技术选型

### 核心框架
| 技术 | 版本 | 用途 | 理由 |
|------|------|------|------|
| Electron | ^41.0.0 | 桌面应用框架 | 跨平台，生态成熟 |
| React | ^18.2.0 | UI 框架 | 组件化，生态丰富 |
| TypeScript | ^5.3.0 | 类型系统 | 类型安全，开发体验 |
| Vite | ^5.0.0 | 构建工具 | 快速，热更新 |

### 状态管理
| 技术 | 版本 | 用途 | 理由 |
|------|------|------|------|
| Zustand | ^4.5.0 | 状态管理 | 轻量，简单，TypeScript 友好 |

### 测试工具
| 技术 | 版本 | 用途 | 理由 |
|------|------|------|------|
| Vitest | ^1.3.0 | 单元测试 | 快速，Vite 集成 |
| Playwright | ^1.42.0 | E2E 测试 | 功能强大，跨浏览器 |
| @testing-library/react | ^14.0.0 | 组件测试 | React 测试最佳实践 |

### 代码质量
| 工具 | 用途 |
|------|------|
| ESLint | 代码检查 |
| Prettier | 代码格式化 |
| Husky | Git 钩子 |
| lint-staged | 暂存文件检查 |

---

## 📝 TypeScript 类型定义

### 核心类型

**src/shared/types.ts**:
```typescript
/**
 * 记录类型
 */
export type RecordType = 'income' | 'expense';

/**
 * 记账记录
 */
export interface Record {
  id?: number;
  type: RecordType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  created_at?: string; // ISO 8601
}

/**
 * 分类
 */
export interface Category {
  id?: number;
  name: string;
  type: RecordType;
  icon?: string;
}

/**
 * 统计数据
 */
export interface Statistics {
  type: RecordType;
  category: string;
  total: number;
}

/**
 * 月度汇总
 */
export interface MonthlySummary {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  balance: number;
}

/**
 * API 响应结果
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 错误对象
 */
export interface AppError {
  code: string;
  message: string;
  details?: any;
}
```

### 验证函数

**src/renderer/utils/validation.ts**:
```typescript
import { Record, Category } from '../types';

/**
 * 验证记账记录
 */
export function validateRecord(record: Partial<Record>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 必填字段
  if (!record.type) errors.push('类型是必填项');
  if (!record.amount) errors.push('金额是必填项');
  if (!record.category) errors.push('分类是必填项');
  if (!record.date) errors.push('日期是必填项');

  // 类型验证
  if (record.type && !['income', 'expense'].includes(record.type)) {
    errors.push('类型必须是 income 或 expense');
  }

  // 金额验证
  if (record.amount !== undefined) {
    if (typeof record.amount !== 'number' || isNaN(record.amount)) {
      errors.push('金额必须是数字');
    } else if (record.amount <= 0 || record.amount > 1000000000) {
      errors.push('金额必须在 0 到 10 亿之间');
    }
  }

  // 日期验证
  if (record.date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(record.date)) {
      errors.push('日期格式必须是 YYYY-MM-DD');
    } else {
      const date = new Date(record.date);
      if (isNaN(date.getTime())) {
        errors.push('无效的日期');
      }
    }
  }

  // 分类验证
  if (record.category && (record.category.length < 1 || record.category.length > 50)) {
    errors.push('分类名称长度必须在 1-50 字符之间');
  }

  // 备注验证
  if (record.note && record.note.length > 200) {
    errors.push('备注长度不能超过 200 字符');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证分类
 */
export function validateCategory(category: Partial<Category>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!category.name) errors.push('分类名称是必填项');
  if (!category.type) errors.push('分类类型是必填项');

  if (category.name && (category.name.length < 1 || category.name.length > 50)) {
    errors.push('分类名称长度必须在 1-50 字符之间');
  }

  if (category.type && !['income', 'expense'].includes(category.type)) {
    errors.push('分类类型必须是 income 或 expense');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 🎨 React 组件示例

### RecordForm 组件

**src/renderer/components/record/RecordForm.tsx**:
```tsx
import React, { useState, useCallback } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { useNotification } from '../../hooks/useNotification';
import { recordService } from '../../services/recordService';
import { validateRecord } from '../../utils/validation';
import type { RecordType } from '../../types';
import './RecordForm.css';

interface RecordFormProps {
  onSuccess?: () => void;
}

export const RecordForm: React.FC<RecordFormProps> = ({ onSuccess }) => {
  const [type, setType] = useState<RecordType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { categories } = useCategories(type);
  const { showNotification } = useNotification();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const record = {
      type,
      amount: parseFloat(amount),
      category,
      date,
      note
    };

    // 验证
    const validation = validateRecord(record);
    if (!validation.valid) {
      showNotification('验证失败', validation.errors.join('\n'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await recordService.addRecord(record);
      showNotification('成功', '记账成功！', 'success');
      
      // 重置表单
      setAmount('');
      setNote('');
      onSuccess?.();
    } catch (error) {
      showNotification('失败', error instanceof Error ? error.message : '未知错误', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [type, amount, category, date, note, onSuccess, showNotification]);

  return (
    <form className="record-form" onSubmit={handleSubmit}>
      <div className="type-selector">
        <button
          type="button"
          className={`type-btn expense ${type === 'expense' ? 'active' : ''}`}
          onClick={() => setType('expense')}
        >
          支出
        </button>
        <button
          type="button"
          className={`type-btn income ${type === 'income' ? 'active' : ''}`}
          onClick={() => setType('income')}
        >
          收入
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="amount">金额</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          min="0.01"
          max="1000000000"
          required
          placeholder="0.00"
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">分类</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="date">日期</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="note">备注</label>
        <input
          type="text"
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          placeholder="可选"
        />
      </div>

      <button 
        type="submit" 
        className="submit-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? '提交中...' : '确认记账'}
      </button>
    </form>
  );
};
```

### 自定义 Hook

**src/renderer/hooks/useRecords.ts**:
```tsx
import { useState, useEffect, useCallback } from 'react';
import { recordService } from '../services/recordService';
import type { Record } from '../types';

export function useRecords(month: string) {
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await recordService.getRecords(month);
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载失败'));
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  const deleteRecord = useCallback(async (id: number) => {
    await recordService.deleteRecord(id);
    await loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  return {
    records,
    isLoading,
    error,
    refresh: loadRecords,
    deleteRecord
  };
}
```

---

## 🧪 测试策略

### 单元测试示例

**tests/unit/renderer/components/RecordForm.test.tsx**:
```tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecordForm } from '../../../../src/renderer/components/record/RecordForm';
import { recordService } from '../../../../src/renderer/services/recordService';

// Mock API
vi.mock('../../../../src/renderer/services/recordService');

describe('RecordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields', () => {
    render(<RecordForm />);
    
    expect(screen.getByLabelText('金额')).toBeInTheDocument();
    expect(screen.getByLabelText('分类')).toBeInTheDocument();
    expect(screen.getByLabelText('日期')).toBeInTheDocument();
    expect(screen.getByLabelText('备注')).toBeInTheDocument();
  });

  it('should submit valid record', async () => {
    vi.mocked(recordService.addRecord).mockResolvedValue({ id: 1 });

    render(<RecordForm />);
    
    fireEvent.change(screen.getByLabelText('金额'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('分类'), { target: { value: '餐饮' } });
    fireEvent.change(screen.getByLabelText('日期'), { target: { value: '2026-03-13' } });
    
    fireEvent.click(screen.getByText('确认记账'));
    
    await waitFor(() => {
      expect(recordService.addRecord).toHaveBeenCalledWith({
        type: 'expense',
        amount: 100,
        category: '餐饮',
        date: '2026-03-13',
        note: ''
      });
    });
  });

  it('should show validation error for invalid amount', async () => {
    render(<RecordForm />);
    
    fireEvent.change(screen.getByLabelText('金额'), { target: { value: '-100' } });
    fireEvent.click(screen.getByText('确认记账'));
    
    await waitFor(() => {
      expect(screen.getByText(/金额必须在 0 到 10 亿之间/i)).toBeInTheDocument();
    });
  });
});
```

---

## 📅 实施计划

### 第 1 周：基础架构
- [ ] Day 1-2: 项目初始化 (TypeScript + Vite + React)
- [ ] Day 3-4: 主进程重构 (模块化拆分)
- [ ] Day 5: Preload 脚本迁移

### 第 2 周：渲染进程
- [ ] Day 6-7: React 组件开发
- [ ] Day 8-9: Hooks 和服务层
- [ ] Day 10: 样式和 UI 优化

### 第 3 周：测试和文档
- [ ] Day 11-12: 单元测试编写
- [ ] Day 13: 集成测试
- [ ] Day 14: 文档更新和最终验收

---

## ✅ 验收标准

### 代码质量
- [ ] TypeScript 无错误
- [ ] ESLint 无警告
- [ ] 单测覆盖率 >80%
- [ ] 所有文件 <300 行

### 功能完整
- [ ] 所有现有功能正常工作
- [ ] 性能无退化
- [ ] 用户体验提升

### 文档完善
- [ ] README 更新
- [ ] API 文档完整
- [ ] 架构文档完整

---

**状态**: 📋 计划中  
**下次更新**: 2026-03-15
