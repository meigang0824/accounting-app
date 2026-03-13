/**
 * Electron 主进程 - 安全加固版
 * 
 * 安全特性:
 * - contextIsolation: true
 * - nodeIntegration: false
 * - 参数化 SQL 查询
 * - 全局错误处理
 * - 输入验证
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

let mainWindow;
let db;

/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // ✅ 安全配置
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // ✅ 额外安全加固
      webSecurity: true,
      enableRemoteModule: false,
      sandbox: true
    },
    title: '简易记账本',
    icon: path.join(__dirname, 'icon.png')
  });

  // ✅ 设置内容安全策略 (CSP)
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
        ]
      }
    });
  });

  mainWindow.loadFile('index.html');
  
  // 开发模式下打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    if (db) db.close();
    mainWindow = null;
  });
}

/**
 * 初始化数据库
 */
function initDatabase() {
  const dbPath = path.join(__dirname, 'accounting.db');
  db = new Database(dbPath);

  // 启用外键约束
  db.pragma('foreign_keys = ON');

  // 创建记录表 (带约束)
  db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL CHECK(amount > 0 AND amount <= 1000000000),
      category TEXT NOT NULL CHECK(length(category) > 0 AND length(category) <= 50),
      date TEXT NOT NULL CHECK(date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
      note TEXT DEFAULT '' CHECK(length(note) <= 200),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建分类表 (带约束)
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL CHECK(length(name) > 0 AND length(name) <= 50),
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      icon TEXT DEFAULT '📝'
    )
  `);

  // 添加索引 (性能优化)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_records_date ON records(date);
    CREATE INDEX IF NOT EXISTS idx_records_type ON records(type);
    CREATE INDEX IF NOT EXISTS idx_records_category ON records(category);
  `);

  // 插入默认分类
  const defaultCategories = [
    ['餐饮', 'expense', '🍜'],
    ['交通', 'expense', '🚗'],
    ['购物', 'expense', '🛍️'],
    ['娱乐', 'expense', '🎬'],
    ['医疗', 'expense', '💊'],
    ['居住', 'expense', '🏠'],
    ['工资', 'income', '💰'],
    ['奖金', 'income', '🎁'],
    ['投资', 'income', '📈'],
    ['其他', 'income', '📝']
  ];

  const insert = db.prepare('INSERT OR IGNORE INTO categories (name, type, icon) VALUES (?, ?, ?)');
  defaultCategories.forEach(cat => insert.run(cat[0], cat[1], cat[2]));

  console.log('[Database] Initialized successfully');
}

/**
 * IPC 错误处理中间件
 * @param {Function} handler - IPC 处理函数
 * @returns {Function} 包装后的处理函数
 */
const handleIPC = (handler) => {
  return async (event, ...args) => {
    try {
      return await handler(event, ...args);
    } catch (error) {
      console.error('[IPC Error]', handler.name || 'anonymous', error);
      // 发送错误到渲染进程
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('error', {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR'
        });
      }
      throw error;
    }
  };
};

/**
 * 注册 IPC 处理器
 */
function registerIPCHandlers() {
  // 获取记录列表
  ipcMain.handle('get-records', handleIPC(async (event, { month }) => {
    let sql = 'SELECT * FROM records ORDER BY date DESC';
    const params = [];
    
    if (month) {
      sql = 'SELECT * FROM records WHERE date LIKE ? ORDER BY date DESC';
      params.push(`${month}%`);
    }
    
    return db.prepare(sql).all(...params);
  }));

  // 添加记录
  ipcMain.handle('add-record', handleIPC(async (event, record) => {
    const { type, amount, category, date, note } = record;
    
    // 验证输入 (双重验证)
    if (!type || !amount || !category || !date) {
      throw new Error('缺少必填字段');
    }
    
    if (amount <= 0 || amount > 1000000000) {
      throw new Error('金额必须大于 0 且不超过 10 亿');
    }
    
    if (!['income', 'expense'].includes(type)) {
      throw new Error('无效的类型');
    }
    
    const stmt = db.prepare(
      'INSERT INTO records (type, amount, category, date, note) VALUES (?, ?, ?, ?, ?)'
    );
    return stmt.run(type, amount, category, date, note || '');
  }));

  // 删除记录
  ipcMain.handle('delete-record', handleIPC(async (event, id) => {
    if (typeof id !== 'number' || id <= 0) {
      throw new Error('无效的记录 ID');
    }
    return db.prepare('DELETE FROM records WHERE id = ?').run(id);
  }));

  // 获取分类列表
  ipcMain.handle('get-categories', handleIPC(async (event, type) => {
    let sql = 'SELECT * FROM categories';
    const params = [];
    
    if (type) {
      sql += ' WHERE type = ?';
      params.push(type);
    }
    
    return db.prepare(sql).all(...params);
  }));

  // 添加分类
  ipcMain.handle('add-category', handleIPC(async (event, { name, type, icon }) => {
    if (!name || typeof name !== 'string' || name.length > 50) {
      throw new Error('分类名称必须在 1-50 字符之间');
    }
    
    if (!['income', 'expense'].includes(type)) {
      throw new Error('无效的分类类型');
    }
    
    return db.prepare('INSERT INTO categories (name, type, icon) VALUES (?, ?, ?)')
      .run(name, type, icon || '📝');
  }));

  // 获取统计数据
  ipcMain.handle('get-statistics', handleIPC(async (event, month) => {
    const sql = `
      SELECT type, category, SUM(amount) as total 
      FROM records 
      WHERE date LIKE ?
      GROUP BY type, category
    `;
    return db.prepare(sql).all(`${month}%`);
  }));

  // 导出数据
  ipcMain.handle('export-data', handleIPC(async (event) => {
    const records = db.prepare('SELECT * FROM records ORDER BY date DESC').all();
    const csv = [
      ['ID', '类型', '金额', '分类', '日期', '备注', '创建时间'],
      ...records.map(r => [r.id, r.type, r.amount, r.category, r.date, r.note, r.created_at])
    ].map(row => row.join(',')).join('\n');
    
    const filePath = path.join(__dirname, `export_${new Date().toISOString().slice(0, 10)}.csv`);
    fs.writeFileSync(filePath, csv, 'utf8');
    return filePath;
  }));

  console.log('[IPC] Handlers registered');
}

// ===== 应用生命周期 =====

app.whenReady().then(() => {
  try {
    initDatabase();
    registerIPCHandlers();
    createWindow();
    console.log('[App] Started successfully');
  } catch (error) {
    console.error('[App] Failed to start:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ===== 全局错误处理 =====

process.on('uncaughtException', (error) => {
  console.error('[uncaughtException]', error);
  // TODO: 集成 electron-log 记录到文件
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[unhandledRejection]', reason);
  // TODO: 集成 electron-log 记录到文件
});

// 优雅退出
app.on('before-quit', () => {
  if (db) {
    db.close();
    console.log('[Database] Closed');
  }
});
