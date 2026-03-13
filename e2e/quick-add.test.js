import { test, expect } from '@playwright/test';

test.describe('快速记账流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('index.html');
  });

  test('完整流程：填写 → 保存', async ({ page }) => {
    // 等待页面加载
    await expect(page.locator('h1')).toContainText('简易记账本');

    // 选择支出类型
    await page.click('button.type-btn.expense');
    await expect(page.locator('button.type-btn.expense')).toHaveClass(/active/);

    // 填写金额
    await page.fill('#amount', '50.00');

    // 选择分类
    await page.selectOption('#category', '餐饮');

    // 填写日期
    await page.fill('#date', '2026-03-13');

    // 填写备注
    await page.fill('#note', '测试午餐');

    // 提交表单
    await page.click('button[type="submit"]');

    // 等待成功提示
    await page.waitForTimeout(500);
    
    // 验证记录出现在列表中
    await expect(page.locator('.record-item').first()).toContainText('餐饮');
    await expect(page.locator('.record-item').first()).toContainText('50.00');
    
    // 验证汇总更新
    await expect(page.locator('#expenseAmount')).toContainText('50.00');
  });

  test('收入记录添加', async ({ page }) => {
    // 切换到收入类型
    await page.click('button.type-btn.income');
    await expect(page.locator('button.type-btn.income')).toHaveClass(/active/);

    // 填写收入信息
    await page.fill('#amount', '10000');
    await page.selectOption('#category', '工资');
    await page.fill('#date', '2026-03-01');
    await page.fill('#note', '3 月工资');

    // 提交
    await page.click('button[type="submit"]');

    // 验证
    await expect(page.locator('#incomeAmount')).toContainText('10000.00');
  });

  test('表单验证 - 金额为空', async ({ page }) => {
    await page.fill('#amount', '');
    await page.selectOption('#category', '餐饮');
    await page.fill('#date', '2026-03-13');

    await page.click('button[type="submit"]');

    // 应该提示错误 (HTML5 验证)
    await expect(page.locator('#amount')).toHaveAttribute('required');
  });

  test('表单验证 - 金额为负数', async ({ page }) => {
    await page.fill('#amount', '-50');
    await page.selectOption('#category', '餐饮');
    await page.fill('#date', '2026-03-13');

    await page.click('button[type="submit"]');

    // 验证没有新记录添加 (因为数据库 CHECK 约束)
    const recordCount = await page.locator('.record-item').count();
    expect(recordCount).toBe(0);
  });
});
