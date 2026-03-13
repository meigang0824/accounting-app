import { describe, it, expect } from 'vitest';
import { 
  validateAmount, 
  validateDate, 
  validateType, 
  validateCategory 
} from '../utils/validation';

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
});
