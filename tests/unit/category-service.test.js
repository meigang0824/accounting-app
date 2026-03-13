import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * 分类服务类
 */
class CategoryService {
  constructor(db) {
    this.db = db;
  }

  create(category) {
    const stmt = this.db.prepare(`
      INSERT INTO categories (name, type, icon)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(category.name, category.type, category.icon || '📝');
    return { id: result.lastInsertRowid, ...category };
  }

  getAll() {
    return this.db.prepare('SELECT * FROM categories ORDER BY type, name').all();
  }

  getByType(type) {
    if (!type) return this.getAll();
    return this.db.prepare(`
      SELECT * FROM categories 
      WHERE type = ? 
      ORDER BY name
    `).all(type);
  }

  delete(id) {
    return this.db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  }
}

describe('CategoryService', () => {
  let db;
  let categoryService;
  const testDbPath = path.join(__dirname, 'test-categories.db');

  beforeEach(() => {
    db = new Database(testDbPath);
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
        icon TEXT
      )
    `);

    categoryService = new CategoryService(db);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('createCategory', () => {
    it('应该成功创建支出分类', () => {
      const category = {
        name: '测试分类',
        type: 'expense',
        icon: '🧪'
      };

      const result = categoryService.create(category);
      expect(result.id).toBeGreaterThan(0);

      const saved = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.id);
      expect(saved.name).toBe('测试分类');
      expect(saved.type).toBe('expense');
      expect(saved.icon).toBe('🧪');
    });

    it('应该成功创建收入分类', () => {
      const category = {
        name: '兼职收入',
        type: 'income',
        icon: '💼'
      };

      const result = categoryService.create(category);
      expect(result.id).toBeGreaterThan(0);
    });

    it('分类名称不能重复', () => {
      const category1 = { name: '餐饮', type: 'expense', icon: '🍜' };
      const category2 = { name: '餐饮', type: 'expense', icon: '🍔' };

      categoryService.create(category1);
      
      expect(() => categoryService.create(category2))
        .toThrow('UNIQUE constraint failed');
    });

    it('类型必须是 expense 或 income', () => {
      const invalidCategory = {
        name: '无效分类',
        type: 'invalid',
        icon: '❌'
      };

      expect(() => categoryService.create(invalidCategory))
        .toThrow('CHECK constraint failed');
    });
  });

  describe('getCategories', () => {
    beforeEach(() => {
      const insert = db.prepare(`
        INSERT INTO categories (name, type, icon) VALUES (?, ?, ?)
      `);

      insert.run('餐饮', 'expense', '🍜');
      insert.run('交通', 'expense', '🚗');
      insert.run('工资', 'income', '💰');
      insert.run('奖金', 'income', '🎁');
    });

    it('应该获取所有分类', () => {
      const categories = categoryService.getAll();
      expect(categories.length).toBe(4);
    });

    it('应该按类型筛选分类', () => {
      const expenses = categoryService.getByType('expense');
      expect(expenses.length).toBe(2);
      expect(expenses.every(c => c.type === 'expense')).toBe(true);

      const incomes = categoryService.getByType('income');
      expect(incomes.length).toBe(2);
    });

    it('空类型应该返回所有分类', () => {
      const categories = categoryService.getByType(null);
      expect(categories.length).toBe(4);
    });
  });

  describe('deleteCategory', () => {
    it('应该成功删除分类', () => {
      const result = db.prepare(`
        INSERT INTO categories (name, type, icon) VALUES ('测试', 'expense', '🧪')
      `).run();

      const deleteResult = categoryService.delete(result.lastInsertRowid);
      expect(deleteResult.changes).toBe(1);

      const deleted = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
      expect(deleted).toBeUndefined();
    });
  });
});
