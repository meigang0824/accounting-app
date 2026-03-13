# 📝 日志系统使用指南

## 快速开始

### 日志文件位置

**Windows:**
```
%APPDATA%\accounting-app\logs\accounting-app.log
```

**macOS:**
```
~/Library/Logs/accounting-app/accounting-app.log
```

**Linux:**
```
~/.config/accounting-app/logs/accounting-app.log
```

---

## 日志级别

| 级别 | 方法 | 使用场景 | 示例 |
|------|------|---------|------|
| **Error** | `log.error()` | 错误、异常、失败操作 | 数据库查询失败、验证失败 |
| **Warn** | `log.warn()` | 警告、非预期但可处理 | 删除不存在的记录 |
| **Info** | `log.info()` | 重要业务操作 | IPC 调用、数据导出 |
| **Debug** | `log.debug()` | 调试信息 | SQL 执行详情、返回值数量 |
| **Silly** | `log.silly()` | 详细调试（开发用） | 每个函数入口/出口 |

---

## 使用示例

### 基本日志记录

```javascript
const log = require('electron-log');

// Info - 记录业务操作
log.info('[IPC] get-records called', { month: '2026-03' });

// Debug - 记录详细过程
log.debug('[DB] Retrieved', records.length, 'records');

// Warn - 记录警告
log.warn('[DB] No record found with id', id);

// Error - 记录错误
log.error('[DB] Query failed:', error.message);
```

### 错误日志记录

```javascript
function logError(operation, error, context = {}) {
  // 敏感信息自动脱敏
  const sanitizedContext = {};
  for (const [key, value] of Object.entries(context)) {
    if (key === 'password' || key === 'secret' || key === 'token') {
      sanitizedContext[key] = '***REDACTED***';
    } else {
      sanitizedContext[key] = value;
    }
  }
  
  log.error(`[DB Error] ${operation}: ${error.message}`, {
    context: sanitizedContext,
    stack: error.stack
  });
}

// 使用示例
try {
  db.prepare('SELECT * FROM records').all();
} catch (error) {
  logError('get-records', error, { month: '2026-03' });
  throw new Error('Failed to retrieve records: ' + error.message);
}
```

### 输入验证日志

```javascript
log.info('[IPC] add-record called', { 
  type: record?.type,           // ✅ 记录类型
  category: record?.category,   // ✅ 记录分类
  amount: record?.amount,       // ✅ 记录金额
  hasNote: !!record?.note       // ✅ 仅记录是否有备注（不记录内容）
});
```

---

## 配置选项

### 日志级别配置

```javascript
// 开发环境 - 显示所有日志
log.transports.file.level = 'silly';
log.transports.console.level = 'silly';

// 生产环境 - 仅记录警告和错误
log.transports.file.level = 'warn';
log.transports.console.level = 'error';

// 测试环境 - 仅记录错误
log.transports.file.level = 'error';
log.transports.console.level = 'error';
```

### 日志文件配置

```javascript
// 单文件最大大小（字节）
log.transports.file.maxSize = 2 * 1024 * 1024; // 2MB

// 保留的文件数量
log.transports.file.files = 5;

// 日志文件名
log.transports.file.fileName = 'accounting-app.log';

// 日志格式
log.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s}:{ms} {text}';
```

### 日志输出位置

```javascript
// 自定义日志目录
log.transports.file.resolvePathFn = () => {
  return path.join(__dirname, 'logs/accounting-app.log');
};
```

---

## 日志分析

### PowerShell 命令

```powershell
# 查看最近的错误
Get-Content $env:APPDATA\accounting-app\logs\accounting-app.log | Select-String "ERROR" -Context 2

# 统计 IPC 调用次数
Get-Content $env:APPDATA\accounting-app\logs\accounting-app.log | Select-String "\[IPC\]" | Measure-Object

# 查看特定时间段的操作
Get-Content $env:APPDATA\accounting-app\logs\accounting-app.log | Select-String "2026-03-13 10:"

# 查看最近的日志（最后 50 行）
Get-Content $env:APPDATA\accounting-app\logs\accounting-app.log -Tail 50

# 导出错误日志到新文件
Get-Content $env:APPDATA\accounting-app\logs\accounting-app.log | Select-String "ERROR" > errors.txt
```

### Bash 命令

```bash
# 查看最近的错误
grep "ERROR" ~/Library/Logs/accounting-app/accounting-app.log | tail -20

# 统计 IPC 调用次数
grep "\[IPC\]" ~/Library/Logs/accounting-app/accounting-app.log | wc -l

# 查看特定时间段的操作
grep "2026-03-13 10:" ~/Library/Logs/accounting-app/accounting-app.log

# 实时监控日志
tail -f ~/Library/Logs/accounting-app/accounting-app.log
```

---

## 最佳实践

### ✅ 推荐做法

1. **记录关键操作**
   ```javascript
   log.info('[IPC] export-data called');
   log.info('[IPC] export-data succeeded', { filePath, recordCount });
   ```

2. **记录错误上下文**
   ```javascript
   catch (error) {
     logError('add-record', error, { type: record?.type, category: record?.category });
     throw new Error('Failed to add record: ' + error.message);
   }
   ```

3. **敏感信息脱敏**
   ```javascript
   log.info('[Auth] Login attempt', { 
     username: user?.username,
     hasPassword: !!user?.password  // ✅ 不记录密码本身
   });
   ```

4. **使用统一前缀**
   ```javascript
   log.info('[DB] Query executed');
   log.info('[IPC] Handler called');
   log.info('[Auth] User authenticated');
   ```

### ❌ 避免做法

1. **不要记录敏感数据**
   ```javascript
   // ❌ 错误
   log.info('User login', { password: user.password });
   
   // ✅ 正确
   log.info('User login', { hasPassword: !!user.password });
   ```

2. **不要记录过大的数据**
   ```javascript
   // ❌ 错误
   log.info('Records', { data: allRecords });  // 可能几 MB
   
   // ✅ 正确
   log.info('Records', { count: allRecords.length });
   ```

3. **不要在循环中频繁记录**
   ```javascript
   // ❌ 错误
   records.forEach(r => log.debug('Record', r));
   
   // ✅ 正确
   log.debug('Records', { count: records.length });
   ```

---

## 故障排查

### 问题：日志文件不存在

**解决方案:**
1. 检查应用是否已启动
2. 检查日志目录权限
3. 确认 `log.transports.file.level` 设置正确

### 问题：日志文件过大

**解决方案:**
1. 减小 `log.transports.file.maxSize`
2. 生产环境使用 `log.transports.file.level = 'warn'`
3. 定期清理旧日志文件

### 问题：日志记录性能慢

**解决方案:**
1. 减少 `log.debug()` 和 `log.silly()` 的使用
2. 生产环境关闭控制台输出：`log.transports.console.level = false`
3. 避免在循环中记录日志

---

## 日志格式说明

默认格式：`{y}-{m}-{d} {h}:{i}:{s}:{ms} {text}`

示例输出：
```
2026-03-13 10:00:00:123 [App] Application started successfully
2026-03-13 10:00:01:456 [DB] Initializing database at: C:\...\accounting.db
2026-03-13 10:00:01:789 [DB] Database initialized successfully with 10 default categories
2026-03-13 10:00:05:012 [IPC] get-records called { month: '2026-03' }
2026-03-13 10:00:05:034 [DB] Retrieved records for month: 2026-03
2026-03-13 10:00:05:045 [IPC] get-records returned 42 records
```

---

## 相关文档

- [安全修复报告](./SECURITY_FIX_REPORT.md)
- [SQL 注入测试](./tests/security/sql-injection.test.js)
- [electron-log 官方文档](https://github.com/megahertz/electron-log)

---

*最后更新：2026-03-13*
