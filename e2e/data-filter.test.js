import { test, expect } from '@playwright/test';

test.describe('数据筛选与搜索', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('index.html');
    
    // 添加测试数据
    await addRecord(page, 'expense', '50', '餐饮', '2026-03-13', '午餐');
    await addRecord(page, 'expense', '30', '交通', '2026-03-13', '打车');
    await addRecord(page, 'income', '10000', '工资', '2026-03-01', '工资');
    await addRecord(page, 'expense', '200', '餐饮', '2026-02-28', '聚餐');
  });

  test('月份切换', async ({ page }) => {
    // 当前显示 3 月
    await expect(page.locator('#currentMonth')).toContainText('2026-03');

    // 切换到 2 月
    await page.click('button:has-text("上月")');
    await expect(page.locator('#currentMonth')).toContainText('2026-02');

    // 验证只显示 2 月记录
    await expect(page.locator('.record-item')).toHaveCount(1);
    await expect(page.locator('.record-item')).toContainText('聚餐');

    // 切换回 3 月
    await page.click('button:has-text("下月")');
    await expect(page.locator('#currentMonth')).toContainText('2026-03');
  });

  test('类型筛选', async ({ page }) => {
    // 切换到支出
    await page.click('button.type-btn.expense');
    await expect(page.locator('button.type-btn.expense')).toHaveClass(/active/);

    // 验证分类列表只包含支出分类
    const options = await page.locator('#category option').allTextContents();
    expect(options.some(opt => opt.includes('餐饮'))).toBe(true);
    expect(options.some(opt => opt.includes('交通'))).toBe(true);

    // 切换到收入
    await page.click('button.type-btn.income');
    
    const incomeOptions = await page.locator('#category option').allTextContents();
    expect(incomeOptions.some(opt => opt.includes('工资'))).toBe(true);
    expect(incomeOptions.some(opt => opt.includes('奖金'))).toBe(true);
  });

  test('删除记录', async ({ page }) => {
    const initialCount = await page.locator('.record-item').count();
    expect(initialCount).toBeGreaterThan(0);

    // 删除第一条记录
    page.on('dialog', dialog => dialog.accept());
    await page.click('.delete-btn:first-child');
    
    // 验证数量减少
    await expect(page.locator('.record-item')).toHaveCount(initialCount - 1);
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
  
  // 切换回支出以便下次添加
  if (type === 'income') {
    await page.click('button.type-btn.expense');
  }
}
