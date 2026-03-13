import { test, expect } from '@playwright/test';

test.describe('图表展示与统计', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('index.html');
    
    // 添加测试数据
    await addRecord(page, 'income', '10000', '工资', '2026-03-01', '工资');
    await addRecord(page, 'expense', '500', '餐饮', '2026-03-13', '聚餐');
    await addRecord(page, 'expense', '300', '购物', '2026-03-15', '买衣服');
  });

  test('汇总卡片显示', async ({ page }) => {
    // 验证收入
    await expect(page.locator('#incomeAmount')).toContainText('10000.00');
    
    // 验证支出
    await expect(page.locator('#expenseAmount')).toContainText('800.00');
    
    // 验证结余
    await expect(page.locator('#balanceAmount')).toContainText('9200.00');
  });

  test('数据导出', async ({ page }) => {
    // 监听文件下载
    const downloadPromise = page.waitForEvent('download');

    await page.click('button.export-btn');

    const download = await downloadPromise;
    
    // 验证下载文件名
    expect(download.suggestedFilename()).toContain('export_');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('空状态显示', async ({ page }) => {
    // 切换到空月份 (连续点击上月)
    for (let i = 0; i < 12; i++) {
      await page.click('button:has-text("上月")');
      await page.waitForTimeout(100);
    }

    // 应该显示空状态
    await expect(page.locator('.records-list')).toContainText('本月暂无记录');
  });
});

async function addRecord(page, type, amount, category, date, note) {
  if (type === 'income') {
    await page.click('button.type-btn.income');
  } else {
    await page.click('button.type-btn.expense');
  }
  await page.fill('#amount', amount);
  await page.selectOption('#category', category);
  await page.fill('#date', date);
  await page.fill('#note', note);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(300);
  
  // 切换回支出
  if (type === 'income') {
    await page.click('button.type-btn.expense');
  }
}
