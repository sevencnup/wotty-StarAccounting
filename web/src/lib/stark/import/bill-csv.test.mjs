import assert from "node:assert/strict";
import test from "node:test";
import { detectBillFilePlatform, detectBillPlatform, parseAlipayBillCsv, parseBillCsv, parseBillFile, parseWechatBillCsv } from "./bill-csv.ts";
import * as XLSX from "xlsx";

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

test("rejects an Alipay file selected as a WeChat bill", () => {
  const content = `支付宝交易记录明细查询\n交易创建时间,交易分类,交易对方,商品说明,收/支,金额（元）\n2026-07-15 09:00:00,工资薪酬,示例公司,工资,收入,6800.00`;
  assert.deepEqual(parseWechatBillCsv(content), []);
  assert.equal(parseAlipayBillCsv(content).length, 1);
});

test("parses an Alipay file after automatically selecting its detected platform", () => {
  const content = `支付宝交易记录明细查询\n交易创建时间,交易分类,交易对方,商品说明,收/支,金额（元）\n2026-07-15 09:00:00,工资薪酬,示例公司,工资,收入,6800.00`;
  const detected = detectBillPlatform(content);

  assert.equal(detected, "支付宝");
  assert.equal(parseBillCsv(content, detected).length, 1);
});

test("parses full WeChat fields and preserves the transaction order number", () => {
  const content = `﻿微信支付账单明细\n交易时间,交易类型,交易对方,商品,收/支,金额(元),支付方式,当前状态,交易单号,商户单号,备注\n2026/08/01 08:30,转账,房东,房租,支出,"¥1,234.50",零钱,支付成功,wx-order-1,merchant-1,八月房租`;
  const [row] = parseWechatBillCsv(content);
  assert.deepEqual(row, {
    amount: 1234.5,
    type: "TRANSFER",
    category: "转账",
    platform: "微信",
    merchant: "房东",
    date: "2026-08-01 08:30:00",
    description: "房租 - 八月房租",
    paymentMethod: "零钱",
    status: "支付成功",
    orderId: "wx-order-1",
  });
});

test("uses Alipay transaction number before merchant order number", () => {
  const content = `支付宝交易记录明细查询\n交易创建时间,交易分类,交易对方,商品说明,收/支,金额（元）,收/付款方式,交易状态,交易号,商家订单号,备注\n2026-08-02 09:00:00,生活缴费,房东,水电费,支出,"2,000.00",余额,交易成功,alipay-order-1,merchant-order-1,八月水电`;
  const [row] = parseAlipayBillCsv(content);
  assert.equal(row.type, "EXPENSE");
  assert.equal(row.orderId, "alipay-order-1");
  assert.equal(row.description, "水电费 - 八月水电");
  assert.equal(row.paymentMethod, "余额");
  assert.equal(row.status, "交易成功");
});

test("falls back to Alipay merchant order number and skips invalid rows", () => {
  const content = `支付宝交易记录明细查询\n交易创建时间,交易分类,交易对方,商品说明,收/支,金额（元）,商家订单号\n2026-08-02 09:00:00,购物,商场,商品,支出,0,merchant-zero\n2026-08-02 10:00:00,购物,商场,商品,支出,10.00,merchant-order-2`;
  const rows = parseAlipayBillCsv(content);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].orderId, "merchant-order-2");
});

test("keeps WeChat files with a transaction number classified as WeChat", () => {
  const content = `微信支付账单明细\n交易时间,交易类型,交易对方,商品,收/支,金额(元),交易单号\n2026-08-04 12:00:00,商户消费,示例餐厅,午餐,支出,25.00,wx-order-2`;
  assert.equal(detectBillPlatform(content), "微信");
  assert.equal(parseBillCsv(content, "微信")[0].orderId, "wx-order-2");
});

test("parses an XLSX workbook through the file entry point", async () => {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet([
    {
      "交易创建时间": "2026-08-03 11:12:00",
      "交易分类": "餐饮美食",
      "交易对方": "示例餐厅",
      "商品说明": "午餐",
      "收/支": "支出",
      "金额（元）": 28.5,
      "收/付款方式": "余额",
      "交易状态": "交易成功",
      "交易号": "xlsx-order-1",
    },
  ]);
  XLSX.utils.book_append_sheet(workbook, sheet, "账单");
  const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const file = new File([bytes], "alipay.xlsx");
  assert.equal(await detectBillFilePlatform(file), "支付宝");
  const rows = await parseBillFile(file, "支付宝");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].orderId, "xlsx-order-1");
  assert.equal(rows[0].amount, 28.5);
});

test("parses an XLSX workbook with title rows before the official header", async () => {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([
    ["微信支付账单明细"],
    ["导出时间：2026-08-31"],
    ["交易时间", "交易类型", "交易对方", "商品", "收/支", "金额(元)", "交易单号"],
    ["2026-08-20 12:30:00", "商户消费", "示例餐厅", "午餐", "支出", 35.5, "wechat-xlsx-1"],
  ]);
  XLSX.utils.book_append_sheet(workbook, sheet, "账单");
  const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const file = new File([bytes], "wechat.xlsx");

  assert.equal(await detectBillFilePlatform(file), "微信");
  const rows = await parseBillFile(file, "微信");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].orderId, "wechat-xlsx-1");
});
