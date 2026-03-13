import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * 统计服务类
 */
class StatisticsService {
  constructor(db) {
    this.db = db;
  }

  getMonthlySummary(month) {
    const result = this.db.prepare(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as totalIncome,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as totalExpense,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance,
        COUNT(*) as transactionCount
      FROM records
      WHERE date LIKE ?
    `).get(`${month}%`);

    return {
      totalIncome: result.totalIncome,
      totalExpense: result.totalExpense,
      balance: result.balance,
      transactionCount: result.transactionCount
    };
  }

  getCategoryBreakdown(month, type) {
    const results = this.db.prepare(`
      SELECT 
        category,
        SUM(amount) as amount,
        COUNT(*) as count
      FROM records
      WHERE date LIKE ? AND type = ?
      GROUP BY category
      ORDER BY amount DESC
    `).all(`${month}%`, type);

    const total = results.reduce((sum, r) => sum + r.amount, 0);

    return results.map(r => ({
      category: r.category,
      amount: r.amount,
      count: r.count,
      percentage: total > 0 ? (r.amount / total * 100) : 0
    }));
  }

  getTrend(startDate, endDate, groupBy) {
    let strftimeFormat;
    
    switch (groupBy) {
      case 'day':
        strftimeFormat = '%Y-%m-%d';
        break;
      case 'month':
        strftimeFormat = '%Y-%m';
        break;
      default:
        strftimeFormat = '%Y-%m-%d';
    }

    const rows = this.db.prepare(`
      SELECT 
        strftime('${strftimeFormat}', date) as period,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
      FROM records
      WHERE date >= ? AND date <= ?
      GROUP BY period
      ORDER BY period ASC
    `).all(startDate, endDate);

    return {
      labels: rows.map(r => r.period),
      income: rows.map(r => r.income),
      expense: rows.map(r => r.expense)
    };
  }

  getCategoryRanking(month, type, options = {}) {
    const limit = options.limit || 10;
    
    const results = this.db.prepare(`
      SELECT 
        category,
        SUM(amount) as amount,
        COUNT(*) as count
      FROM records
      WHERE date LIKE ? AND type = ?
      GROUP BY category
      ORDER BY amount DESC
      LIMIT ?
    `).all(`${month}%`, type, limit);

    return results.map((r, index) => ({
      rank: index + 1,
      category: r.category,
      amount: r.amount,
      count: r.count
    }));
  }
}

describe('StatisticsService', () => {
  let db;
  let statisticsService;
  const testDbPath = path.join(__dirname, 'test-statistics.db');

  beforeEach(() => {
    db = new Database(testDbPath);
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL
      )
    `);

    // 插入测试数据
    const insert = db.prepare(`
      INSERT INTO records (type, amount, category, date) VALUES (?, ?, ?, ?)
    `);

    // 3 月数据
    insert.run('income', 10000, '工资', '2026-03-01');
    insert.run('income', 2000, '奖金', '2026-03-15');
    insert.run('expense', 50, '餐饮', '2026-03-13');
    insert.run('expense', 30, '交通', '2026-03-13');
    insert.run('expense', 200, '餐饮', '2026-03-14');
    insert.run('expense', 500, '购物', '2026-03-10');

    // 2 月数据
    insert.run('expense', 1000, '餐饮', '2026-02-15');

    statisticsService = new StatisticsService(db);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('getMonthlySummary', () => {
    it('应该正确计算月度收支汇总', () => {
      const summary = statisticsService.getMonthlySummary('2026-03');

      expect(summary.totalIncome).toBe(12000);
      expect(summary.totalExpense).toBe(780);
      expect(summary.balance).toBe(11220);
      expect(summary.transactionCount).toBe(6);
    });

    it('空月份应该返回 0', () => {
      const summary = statisticsService.getMonthlySummary('2026-01');

      expect(summary.totalIncome).toBe(0);
      expect(summary.totalExpense).toBe(0);
      expect(summary.balance).toBe(0);
      expect(summary.transactionCount).toBe(0);
    });
  });

  describe('getCategoryBreakdown', () => {
    it('应该正确计算分类统计', () => {
      const breakdown = statisticsService.getCategoryBreakdown('2026-03', 'expense');

      expect(breakdown.length).toBe(3);
      
      const dining = breakdown.find(c => c.category === '餐饮');
      expect(dining.amount).toBe(250);
      expect(dining.percentage).toBeCloseTo(32.05, 1);

      const shopping = breakdown.find(c => c.category === '购物');
      expect(shopping.amount).toBe(500);
      expect(shopping.percentage).toBeCloseTo(64.10, 1);
    });

    it('应该包含分类占比', () => {
      const breakdown = statisticsService.getCategoryBreakdown('2026-03', 'expense');
      
      const totalPercentage = breakdown.reduce((sum, c) => sum + c.percentage, 0);
      expect(totalPercentage).toBeCloseTo(100, 0);
    });
  });

  describe('getTrendData', () => {
    it('应该按日统计趋势', () => {
      const trend = statisticsService.getTrend('2026-03-01', '2026-03-31', 'day');

      expect(trend.labels.length).toBeGreaterThan(0);
      expect(trend.income.length).toBe(trend.labels.length);
      expect(trend.expense.length).toBe(trend.labels.length);
    });

    it('应该按月统计趋势', () => {
      const trend = statisticsService.getTrend('2026-01-01', '2026-03-31', 'month');

      expect(trend.labels).toEqual(['2026-01', '2026-02', '2026-03']);
      expect(trend.expense[1]).toBe(1000); // 2 月
      expect(trend.expense[2]).toBe(780);  // 3 月
    });
  });

  describe('getCategoryRanking', () => {
    it('应该返回支出排行榜', () => {
      const ranking = statisticsService.getCategoryRanking('2026-03', 'expense');

      expect(ranking[0].category).toBe('购物');
      expect(ranking[0].amount).toBe(500);
      expect(ranking[0].rank).toBe(1);

      expect(ranking[1].category).toBe('餐饮');
      expect(ranking[1].amount).toBe(250);
    });

    it('应该支持限制返回数量', () => {
      const ranking = statisticsService.getCategoryRanking('2026-03', 'expense', { limit: 2 });
      expect(ranking.length).toBe(2);
    });
  });
});
