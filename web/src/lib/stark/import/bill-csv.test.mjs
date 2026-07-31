import assert from "node:assert/strict";
import test from "node:test";
import { detectBillPlatform, parseBillCsv } from "./bill-csv.ts";

test("parses a WeChat CSV after its preamble", () => {
  const content = `微信支付账单明细\n导出时间：2026-07-31\n交易时间,交易类型,交易对方,商品,收/支,金额(元),支付方式,当前状态\n2026-07-20 12:30:00,商户消费,示例餐厅,午餐,支出,35.50,零钱,支付成功`;
  const rows = parseBillCsv(content, "微信");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].amount, 35.5);
  assert.equal(rows[0].type, "EXPENSE");
  assert.equal(rows[0].merchant, "示例餐厅");
});

test("parses quoted Alipay values and detects income", () => {
  const content = `支付宝交易记录明细查询\n交易时间,交易分类,交易对方,商品说明,收/支,金额（元）,收/付款方式,交易状态\n2026/07/15 09:00,工资薪酬,示例公司,"7月工资,含奖金",收入,"6,800.00",余额,交易成功`;
  const rows = parseBillCsv(content);
  assert.equal(detectBillPlatform(content), "支付宝");
  assert.equal(rows[0].amount, 6800);
  assert.equal(rows[0].type, "INCOME");
  assert.equal(rows[0].description, "7月工资,含奖金");
});

test("returns no rows when the required header is absent", () => {
  assert.deepEqual(parseBillCsv("普通文本,没有账单字段", "微信"), []);
});
