/**
 * 安全修复验证脚本
 * 
 * 运行此脚本验证 P0 安全修复是否生效
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证 P0 安全修复...\n');

let passed = 0;
let failed = 0;

function check(name, condition, details) {
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    failed++;
  }
}

// 1. 检查 preload.js 存在
const preloadPath = path.join(__dirname, 'preload.js');
check(
  'preload.js 存在',
  fs.existsSync(preloadPath),
  preloadPath
);

// 2. 检查 main.js 安全配置
const mainContent = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
check(
  'main.js 启用 contextIsolation',
  mainContent.includes('contextIsolation: true'),
  'contextIsolation 必须为 true'
);

check(
  'main.js 禁用 nodeIntegration',
  mainContent.includes('nodeIntegration: false'),
  'nodeIntegration 必须为 false'
);

check(
  'main.js 配置 preload 脚本',
  mainContent.includes("preload: path.join(__dirname, 'preload.js')"),
  '必须配置 preload 脚本路径'
);

check(
  'main.js 启用 sandbox',
  mainContent.includes('sandbox: true'),
  '建议启用 sandbox 模式'
);

// 3. 检查参数化查询
check(
  'main.js 使用参数化查询 (get-records)',
  mainContent.includes('WHERE date LIKE ?') || !mainContent.includes("WHERE date LIKE '${month}'"),
  'SQL 查询必须使用参数化'
);

check(
  'main.js 使用参数化查询 (get-categories)',
  mainContent.includes('WHERE type = ?') || !mainContent.includes("WHERE type = '${type}'"),
  'SQL 查询必须使用参数化'
);

// 4. 检查错误处理
check(
  'main.js 包含 try-catch 错误处理',
  mainContent.includes('try {') && mainContent.includes('} catch (error) {'),
  '所有 IPC handlers 必须有错误处理'
);

check(
  'main.js 包含全局错误监听',
  mainContent.includes('uncaughtException') && mainContent.includes('unhandledRejection'),
  '必须监听全局错误'
);

// 5. 检查 preload.js 验证
const preloadContent = fs.readFileSync(preloadPath, 'utf8');
check(
  'preload.js 包含输入验证',
  preloadContent.includes('validateRecord') || preloadContent.includes('验证'),
  'preload 层必须有输入验证'
);

check(
  'preload.js 使用 contextBridge',
  preloadContent.includes('contextBridge.exposeInMainWorld'),
  '必须使用 contextBridge 暴露 API'
);

// 6. 检查 index.html 不使用 require('electron')
const indexContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
// 移除注释后再检查
const indexWithoutComments = indexContent.replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
check(
  'index.html 不使用 require("electron")',
  !indexWithoutComments.includes("require('electron')") && !indexWithoutComments.includes('require("electron")'),
  '渲染进程不能直接 require electron'
);

check(
  'index.html 使用 window.electronAPI',
  indexContent.includes('window.electronAPI'),
  '必须通过 electronAPI 访问 IPC'
);

// 7. 检查 CSP
check(
  'index.html 包含 CSP meta 标签',
  indexContent.includes('Content-Security-Policy'),
  '建议添加内容安全策略'
);

// 8. 检查数据库约束
check(
  'main.js 包含数据库 CHECK 约束',
  mainContent.includes('CHECK('),
  '数据库层面应该有约束'
);

// 9. 检查索引
check(
  'main.js 创建数据库索引',
  mainContent.includes('CREATE INDEX'),
  '应该为常用查询字段创建索引'
);

// 10. 检查文档
const docs = [
  'P0_SECURITY_FIX_REPORT.md',
  'P1_ARCHITECTURE_REFACTOR_PLAN.md',
  'SECURITY_FIX_SUMMARY.md'
];

docs.forEach(doc => {
  check(
    `文档 ${doc} 存在`,
    fs.existsSync(path.join(__dirname, doc)),
    doc
  );
});

// 总结
console.log('\n' + '='.repeat(50));
console.log(`验证完成：${passed + failed} 项`);
console.log(`✅ 通过：${passed}`);
console.log(`❌ 失败：${failed}`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('\n🎉 所有 P0 安全修复已验证通过！');
  process.exit(0);
} else {
  console.log(`\n⚠️  有 ${failed} 项未通过，请检查修复情况。`);
  process.exit(1);
}
