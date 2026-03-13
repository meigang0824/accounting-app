const Database = require('better-sqlite3');
const path = require('path');

async function runBulkDataTest() {
  console.log('🚀 开始大量数据加载测试...');

  const dbPath = path.join(__dirname, '../accounting.db');
  const db = new Database(dbPath);

  // 插入 1000 条测试数据
  console.log('📊 插入 1000 条测试数据...');
  const insert = db.prepare(`
    INSERT INTO records (type, amount, category, date, note)
    VALUES (?, ?, ?, ?, ?)
  `);

  const categories = ['餐饮', '交通', '购物', '娱乐', '工资', '奖金'];
  const types = ['expense', 'income'];

  const insertMany = db.transaction((records) => {
    for (const record of records) {
      insert.run(...record);
    }
  });

  const bulkData = [];
  for (let i = 0; i < 1000; i++) {
    bulkData.push([
      types[Math.floor(Math.random() * types.length)],
      Math.floor(Math.random() * 1000) + 10,
      categories[Math.floor(Math.random() * categories.length)],
      `2026-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      `测试记录 ${i}`
    ]);
  }

  const startTime = Date.now();
  insertMany(bulkData);
  const insertTime = Date.now() - startTime;

  console.log(`✅ 数据插入完成：${insertTime}ms`);

  // 测试查询性能
  console.log('🔍 测试查询性能...');
  
  const queries = [
    { name: '全量查询', sql: 'SELECT * FROM records ORDER BY date DESC' },
    { name: '月份筛选', sql: "SELECT * FROM records WHERE date LIKE '2026-03%' ORDER BY date DESC" },
    { name: '类型筛选', sql: "SELECT * FROM records WHERE type = 'expense' ORDER BY date DESC" },
    { name: '分类统计', sql: 'SELECT category, SUM(amount) as total FROM records GROUP BY category' },
    { name: '月度汇总', sql: "SELECT type, SUM(amount) as total FROM records WHERE date LIKE '2026-03%' GROUP BY type" },
  ];

  let totalQueryTime = 0;
  for (const query of queries) {
    const start = Date.now();
    const result = db.prepare(query.sql).all();
    const duration = Date.now() - start;
    totalQueryTime += duration;
    console.log(`  ${query.name}: ${duration}ms (${result.length} rows)`);
  }

  // 测试分页性能
  console.log('📄 测试分页性能...');
  const pageSize = 20;
  const totalPages = Math.ceil(1000 / pageSize);

  const paginationStart = Date.now();
  for (let page = 1; page <= totalPages; page++) {
    const offset = (page - 1) * pageSize;
    db.prepare(`SELECT * FROM records ORDER BY date DESC LIMIT ${pageSize} OFFSET ${offset}`).all();
  }
  const paginationTime = Date.now() - paginationStart;
  console.log(`  分页查询 (50 页): ${paginationTime}ms`);

  db.close();

  console.log('\n✅ 大量数据加载测试完成');
  console.log('\n📊 性能总结:');
  console.log(`  - 1000 条数据插入：${insertTime}ms`);
  console.log(`  - 平均查询时间：${(totalQueryTime / queries.length).toFixed(2)}ms`);
  console.log(`  - 分页查询 50 页：${paginationTime}ms`);
}

runBulkDataTest();
