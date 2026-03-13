/**
 * Preload 脚本 - 安全的 IPC 桥接层
 * 运行在隔离的上下文中，暴露受限的 API 给渲染进程
 * 
 * 安全特性:
 * - contextBridge 隔离渲染进程与 Node.js
 * - 输入验证在暴露 API 前执行
 * - 类型安全检查
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * 验证记录对象
 * @param {Object} record - 待验证的记录
 * @throws {Error} 验证失败时抛出错误
 */
function validateRecord(record) {
  if (!record || typeof record !== 'object') {
    throw new Error('无效的记录对象');
  }

  // 验证必填字段
  const required = ['type', 'amount', 'category', 'date'];
  for (const field of required) {
    if (!record[field]) {
      throw new Error(`缺少必填字段：${field}`);
    }
  }

  // 验证类型
  if (!['income', 'expense'].includes(record.type)) {
    throw new Error('类型必须是 income 或 expense');
  }

  // 验证金额
  const amount = Number(record.amount);
  if (isNaN(amount) || amount <= 0 || amount > 1000000000) {
    throw new Error('金额必须是 0 到 10 亿之间的数字');
  }

  // 验证日期格式
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(record.date)) {
    throw new Error('日期格式必须是 YYYY-MM-DD');
  }

  const date = new Date(record.date);
  if (isNaN(date.getTime())) {
    throw new Error('无效的日期');
  }

  // 验证分类
  if (typeof record.category !== 'string' || record.category.length > 50) {
    throw new Error('分类名称长度必须在 1-50 字符之间');
  }

  // 验证备注 (可选)
  if (record.note && (typeof record.note !== 'string' || record.note.length > 200)) {
    throw new Error('备注长度不能超过 200 字符');
  }

  return {
    ...record,
    amount: amount,
    note: record.note || ''
  };
}

/**
 * 验证分类对象
 * @param {Object} category - 待验证的分类
 * @throws {Error} 验证失败时抛出错误
 */
function validateCategory(category) {
  if (!category || typeof category !== 'object') {
    throw new Error('无效的分类对象');
  }

  if (!category.name || typeof category.name !== 'string') {
    throw new Error('分类名称必须是非空字符串');
  }

  if (category.name.length > 50) {
    throw new Error('分类名称长度不能超过 50 字符');
  }

  if (!['income', 'expense'].includes(category.type)) {
    throw new Error('分类类型必须是 income 或 expense');
  }

  return {
    name: category.name.trim(),
    type: category.type,
    icon: category.icon || '📝'
  };
}

// 定义暴露给渲染进程的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // ===== 记录相关 API =====
  
  /**
   * 获取记录列表
   * @param {string} month - 月份 (YYYY-MM 格式)
   * @returns {Promise<Array>} 记录列表
   */
  getRecords: async (month) => {
    try {
      // 验证月份格式
      if (month && !/^\d{4}-\d{2}$/.test(month)) {
        throw new Error('月份格式必须是 YYYY-MM');
      }
      return await ipcRenderer.invoke('get-records', { month });
    } catch (error) {
      console.error('[getRecords] Error:', error);
      throw error;
    }
  },

  /**
   * 添加记录
   * @param {Object} record - 记录对象
   * @returns {Promise<Object>} 添加结果
   */
  addRecord: async (record) => {
    try {
      const validatedRecord = validateRecord(record);
      return await ipcRenderer.invoke('add-record', validatedRecord);
    } catch (error) {
      console.error('[addRecord] Error:', error);
      throw error;
    }
  },

  /**
   * 删除记录
   * @param {number} id - 记录 ID
   * @returns {Promise<Object>} 删除结果
   */
  deleteRecord: async (id) => {
    try {
      if (typeof id !== 'number' || id <= 0) {
        throw new Error('无效的记录 ID');
      }
      return await ipcRenderer.invoke('delete-record', id);
    } catch (error) {
      console.error('[deleteRecord] Error:', error);
      throw error;
    }
  },

  // ===== 分类相关 API =====
  
  /**
   * 获取分类列表
   * @param {string} type - 分类类型 (income/expense)
   * @returns {Promise<Array>} 分类列表
   */
  getCategories: async (type) => {
    try {
      if (type && !['income', 'expense'].includes(type)) {
        throw new Error('分类类型必须是 income 或 expense');
      }
      return await ipcRenderer.invoke('get-categories', type);
    } catch (error) {
      console.error('[getCategories] Error:', error);
      throw error;
    }
  },

  /**
   * 添加分类
   * @param {Object} category - 分类对象
   * @returns {Promise<Object>} 添加结果
   */
  addCategory: async (category) => {
    try {
      const validatedCategory = validateCategory(category);
      return await ipcRenderer.invoke('add-category', validatedCategory);
    } catch (error) {
      console.error('[addCategory] Error:', error);
      throw error;
    }
  },

  // ===== 统计相关 API =====
  
  /**
   * 获取统计数据
   * @param {string} month - 月份 (YYYY-MM 格式)
   * @returns {Promise<Array>} 统计数据
   */
  getStatistics: async (month) => {
    try {
      if (month && !/^\d{4}-\d{2}$/.test(month)) {
        throw new Error('月份格式必须是 YYYY-MM');
      }
      return await ipcRenderer.invoke('get-statistics', month);
    } catch (error) {
      console.error('[getStatistics] Error:', error);
      throw error;
    }
  },

  // ===== 导出相关 API =====
  
  /**
   * 导出数据
   * @returns {Promise<string>} 导出文件路径
   */
  exportData: async () => {
    try {
      return await ipcRenderer.invoke('export-data');
    } catch (error) {
      console.error('[exportData] Error:', error);
      throw error;
    }
  },

  // ===== 错误处理 API =====
  
  /**
   * 监听错误事件
   * @param {Function} callback - 错误回调函数
   */
  onError: (callback) => {
    if (typeof callback !== 'function') {
      throw new Error('回调必须是函数');
    }
    ipcRenderer.on('error', (event, error) => callback(error));
  },

  /**
   * 移除错误监听
   * @param {Function} callback - 回调函数
   */
  removeErrorListener: (callback) => {
    ipcRenderer.removeListener('error', callback);
  }
});

// 类型定义 (供 TypeScript 使用)
/**
 * @typedef {Object} Record
 * @property {string} type - 类型 (income/expense)
 * @property {number} amount - 金额
 * @property {string} category - 分类
 * @property {string} date - 日期 (YYYY-MM-DD)
 * @property {string} [note] - 备注
 */

/**
 * @typedef {Object} Category
 * @property {string} name - 分类名称
 * @property {string} type - 分类类型 (income/expense)
 * @property {string} [icon] - 图标
 */

/**
 * @typedef {Object} ElectronAPI
 * @property {(month: string) => Promise<Array>} getRecords
 * @property {(record: Record) => Promise<Object>} addRecord
 * @property {(id: number) => Promise<Object>} deleteRecord
 * @property {(type: string) => Promise<Array>} getCategories
 * @property {(category: Category) => Promise<Object>} addCategory
 * @property {(month: string) => Promise<Array>} getStatistics
 * @property {() => Promise<string>} exportData
 * @property {(callback: Function) => void} onError
 * @property {(callback: Function) => void} removeErrorListener
 */
