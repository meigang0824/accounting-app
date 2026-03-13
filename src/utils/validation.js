import { describe, it, expect } from 'vitest';

/**
 * 数据验证工具函数
 */
export function validateAmount(amount) {
  return typeof amount === 'number' && 
         isFinite(amount) && 
         amount > 0 &&
         amount <= 999999999.99;
}

export function validateDate(date) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

export function validateType(type) {
  return type === 'expense' || type === 'income';
}

export function validateCategory(category) {
  return typeof category === 'string' && category.length > 0 && category.length <= 50;
}

describe('Validation Utils', () => {
  describe('validateAmount', () => {
    it('应该接受正数金额', () => {
      expect(validateAmount(50)).toBe(true);
      expect(validateAmount(0.01)).toBe(true);
      expect(validateAmount(999999.99)).toBe(true);
    });

    it('应该拒绝负数', () => {
      expect(validateAmount(-50)).toBe(false);
    });

    it('应该拒绝 0', () => {
      expect(validateAmount(0)).toBe(false);
    });

    it('应该拒绝非数字', () => {
      expect(validateAmount('50')).toBe(false);
      expect(validateAmount(null)).toBe(false);
      expect(validateAmount(NaN)).toBe(false);
    });

    it('应该拒绝过大金额', () => {
      expect(validateAmount(1000000000)).toBe(false);
    });
  });

  describe('validateDate', () => {
    it('应该接受 YYYY-MM-DD 格式', () => {
      expect(validateDate('2026-03-13')).toBe(true);
      expect(validateDate('2026-01-01')).toBe(true);
    });

    it('应该拒绝错误格式', () => {
      expect(validateDate('2026/03/13')).toBe(false);
      expect(validateDate('03-13-2026')).toBe(false);
      expect(validateDate('2026-3-13')).toBe(false);
    });

    it('应该拒绝无效日期', () => {
      expect(validateDate('2026-02-30')).toBe(false);
      expect(validateDate('2026-13-01')).toBe(false);
    });
  });

  describe('validateType', () => {
    it('应该接受 expense 和 income', () => {
      expect(validateType('expense')).toBe(true);
      expect(validateType('income')).toBe(true);
    });

    it('应该拒绝其他值', () => {
      expect(validateType('transfer')).toBe(false);
      expect(validateType('')).toBe(false);
      expect(validateType('Expense')).toBe(false);
    });
  });

  describe('validateCategory', () => {
    it('应该接受有效分类名称', () => {
      expect(validateCategory('餐饮')).toBe(true);
      expect(validateCategory('工资收入')).toBe(true);
    });

    it('应该拒绝空字符串', () => {
      expect(validateCategory('')).toBe(false);
    });

    it('应该拒绝过长名称', () => {
      expect(validateCategory('a'.repeat(51))).toBe(false);
    });
  });
});
