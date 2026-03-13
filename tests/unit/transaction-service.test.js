import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * 交易服务类 - 核心业务逻辑
 */
class TransactionService {
  constructor(db) {
    this.db = db;
  }

  create(transaction) {
    const stmt = this.db.prepare(`
      INSERT INTO records (type, amount, category, date, note)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      transaction.type,
      transaction.amount,
      transaction.category,
      transaction.date,
      transaction.note || ''
    );
    return { id: result.lastInsertRowid, ...transaction };
  }

  getAll() {
    return this.db.prepare('SELECT * FROM records ORDER BY date DESC').all();
  }

  getByMonth(month) {
    return this.db.prepare(`
      SELECT * FROM records 
      WHERE date LIKE ? 
      ORDER BY date DESC
    `).all(`${month}%`);
  }

  getByType(type) {
    return this.db.prepare(`
      SELECT * FROM records 
      WHERE type = ? 
      ORDER BY date DESC
    `).all(type);
  }

  getPaginated({ page, pageSize }) {
    const offset = (page - 1) * pageSize;
    const transactions = this.db.prepare(`
      SELECT * FROM records 
      ORDER BY date DESC 
      LIMIT ? OFFSET ?
    `).all(pageSize, offset);

    const total = this.db.prepare('SELECT COUNT(*) as count FROM records').get().count;

    return {
      transactions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  update(id, updates) {
    const fields = [];
    const values = [];

    if (updates.amount !== undefined) {
      fields.push('amount = ?');
      values.push(updates.amount);
    }
    if (updates.note !== undefined) {
      fields.push('note = ?');
      values.push(updates.note);
    }

    if (fields.length === 0) return { changes: 0 };

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE records SET ${fields.join(', ')} WHERE id = ?
    `);
    return stmt.run(...values);
  }

  delete(id) {
    return this.db.prepare('DELETE FROM records WHERE id = ?').run(id);
  }

  batchDelete(ids) {
    const placeholders = ids.map(() => '?').join(',');
    return this.db.prepare(`DELETE FROM records WHERE id IN (${placeholders})`).run(...ids);
  }
}

describe('TransactionService', () => {
  let db;
  let transactionService;
  const testDbPath = path.join(__dirname, 'test-accounting.db');

  beforeEach(() => {
    // 创建测试数据库
    db = new Database(testDbPath);
    
    // 初始化表结构
    db.exec(`
      CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    transactionService = new TransactionService(db);
  });

  afterEach(() => {
    db.close();
    // 清理测试数据库
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('createTransaction', () => {
    it('应该成功创建支出记录', () => {
      const transaction = {
        type: 'expense',
        amount: 50.00,
        category: '餐饮',
        date: '2026-03-13',
        note: '午餐'
      };

      const result = transactionService.create(transaction);

      expect(result.id).toBeDefined();
      expect(result.id).toBeGreaterThan(0);
      
      // 验证数据正确写入
      const saved = db.prepare('SELECT * FROM records WHERE id = ?').get(result.id);
      expect(saved.type).toBe('expense');
      expect(saved.amount).toBe(50.00);
      expect(saved.category).toBe('餐饮');
      expect(saved.date).toBe('2026-03-13');
      expect(saved.note).toBe('午餐');
    });

    it('应该成功创建收入记录', () => {
      const transaction = {
        type: 'income',
        amount: 10000.00,
        category: '工资',
        date: '2026-03-01',
        note: '3 月工资'
      };

      const result = transactionService.create(transaction);
      expect(result.id).toBeGreaterThan(0);
    });

    it('金额必须为正数', () => {
      const invalidTransaction = {
        type: 'expense',
        amount: -50,
        category: '餐饮',
        date: '2026-03-13'
      };

      expect(() => transactionService.create(invalidTransaction))
        .toThrow('CHECK constraint failed');
    });

    it('金额为 0 应该抛出错误', () => {
      const invalidTransaction = {
        type: 'expense',
        amount: 0,
        category: '餐饮',
        date: '2026-03-13'
      };

      expect(() => transactionService.create(invalidTransaction))
        .toThrow();
    });
  });

  describe('getTransactions', () => {
    beforeEach(() => {
      // 插入测试数据
      const insert = db.prepare(`
        INSERT INTO records (type, amount, category, date, note)
        VALUES (?, ?, ?, ?, ?)
      `);

      insert.run('expense', 50, '餐饮', '2026-03-13', '午餐');
      insert.run('expense', 30, '交通', '2026-03-13', '打车');
      insert.run('income', 10000, '工资', '2026-03-01', '3 月工资');
      insert.run('expense', 200, '购物', '2026-02-28', '买衣服');
    });

    it('应该获取所有记录', () => {
      const transactions = transactionService.getAll();
      expect(transactions.length).toBe(4);
    });

    it('应该按月份筛选记录', () => {
      const transactions = transactionService.getByMonth('2026-03');
      expect(transactions.length).toBe(3);
      expect(transactions.every(t => t.date.startsWith('2026-03'))).toBe(true);
    });

    it('应该按类型筛选记录', () => {
      const expenses = transactionService.getByType('expense');
      expect(expenses.length).toBe(3);
      expect(expenses.every(t => t.type === 'expense')).toBe(true);

      const incomes = transactionService.getByType('income');
      expect(incomes.length).toBe(1);
    });

    it('应该支持分页', () => {
      const page1 = transactionService.getPaginated({ page: 1, pageSize: 2 });
      expect(page1.transactions.length).toBe(2);
      expect(page1.total).toBe(4);
      expect(page1.totalPages).toBe(2);

      const page2 = transactionService.getPaginated({ page: 2, pageSize: 2 });
      expect(page2.transactions.length).toBe(2);
    });

    it('应该按日期降序排序', () => {
      const transactions = transactionService.getAll();
      expect(transactions[0].date).toBe('2026-03-13');
      expect(transactions[transactions.length - 1].date).toBe('2026-02-28');
    });
  });

  describe('updateTransaction', () => {
    let transactionId;

    beforeEach(() => {
      const result = db.prepare(`
        INSERT INTO records (type, amount, category, date, note)
        VALUES ('expense', 50, '餐饮', '2026-03-13', '午餐')
      `).run();
      transactionId = result.lastInsertRowid;
    });

    it('应该成功更新记录', () => {
      const updates = {
        amount: 55.00,
        note: '午餐 - 修正'
      };

      const result = transactionService.update(transactionId, updates);
      expect(result.changes).toBe(1);

      const updated = db.prepare('SELECT * FROM records WHERE id = ?').get(transactionId);
      expect(updated.amount).toBe(55.00);
      expect(updated.note).toBe('午餐 - 修正');
    });

    it('更新不存在的记录应该返回 0', () => {
      const result = transactionService.update(99999, { amount: 100 });
      expect(result.changes).toBe(0);
    });

    it('应该只更新提供的字段', () => {
      transactionService.update(transactionId, { note: '新备注' });
      
      const updated = db.prepare('SELECT * FROM records WHERE id = ?').get(transactionId);
      expect(updated.note).toBe('新备注');
      expect(updated.amount).toBe(50); // 未改变
      expect(updated.category).toBe('餐饮'); // 未改变
    });
  });

  describe('deleteTransaction', () => {
    let transactionId;

    beforeEach(() => {
      const result = db.prepare(`
        INSERT INTO records (type, amount, category, date)
        VALUES ('expense', 50, '餐饮', '2026-03-13')
      `).run();
      transactionId = result.lastInsertRowid;
    });

    it('应该成功删除记录', () => {
      const result = transactionService.delete(transactionId);
      expect(result.changes).toBe(1);

      const deleted = db.prepare('SELECT * FROM records WHERE id = ?').get(transactionId);
      expect(deleted).toBeUndefined();
    });

    it('删除不存在的记录应该返回 0', () => {
      const result = transactionService.delete(99999);
      expect(result.changes).toBe(0);
    });

    it('批量删除应该成功', () => {
      // 插入更多记录
      db.prepare(`INSERT INTO records (type, amount, category, date) VALUES ('expense', 30, '交通', '2026-03-13')`).run();
      db.prepare(`INSERT INTO records (type, amount, category, date) VALUES ('expense', 200, '购物', '2026-03-12')`).run();

      const result = transactionService.batchDelete([transactionId, transactionId + 1]);
      expect(result.changes).toBe(2);
    });
  });
});
