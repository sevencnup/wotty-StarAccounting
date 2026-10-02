import * as XLSX from "xlsx";
import type { TransactionType } from "@/lib/stark/models";

export type BillPlatform = "微信" | "支付宝";
export type BillImportSource = BillPlatform | "本应用导出";

export type BillImportRow = {
  amount: number;
  type: TransactionType;
  category: string;
  platform: string;
  merchant: string | null;
  date: string;
  description: string | null;
  paymentMethod: string | null;
  status: string | null;
  orderId: string | null;
  remarkCategory?: string | null;
};

type BillRecord = Record<string, unknown>;

function normalizeHeader(value: string) {
  return value
    .replace(/^﻿/, "")
    .replace(/[\s'"「」『』]/g, "")
    .trim();
}

function normalizeText(value: unknown) {
  return value == null ? "" : String(value).trim();
}

function parseCsvRecords(content: string) {
  const records: string[][] = [];
  let record: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    if (char === '"') {
      if (quoted && content[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      record.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && content[index + 1] === "\n") index += 1;
      record.push(cell.trim());
      if (record.some((item) => item.length > 0)) records.push(record);
      record = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  record.push(cell.trim());
  if (record.some((item) => item.length > 0)) records.push(record);
  return records;
}

function headerIndex(headers: string[], names: string[]) {
  const normalizedHeaders = headers.map(normalizeHeader);
  const normalizedNames = names.map(normalizeHeader);
  const exactIndex = normalizedHeaders.findIndex((header) => normalizedNames.includes(header));
  if (exactIndex >= 0) return exactIndex;
  return normalizedHeaders.findIndex((header) => normalizedNames.some((name) => header.includes(name)));
}

function valueAt(record: BillRecord, headers: string[], names: string[]) {
  for (const name of names) {
    const index = headerIndex(headers, [name]);
    if (index < 0) continue;
    const value = normalizeText(record[headers[index]]);
    if (value) return value;
  }
  return "";
}

function parseAmount(value: unknown) {
  if (typeof value === "number") return Math.abs(value);
  const normalized = normalizeText(value).replace(/[¥￥,\s]/g, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.abs(amount) : 0;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateParts(year: number, month: number, day: number, hour = 0, minute = 0, second = 0) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  const date = new Date(year, month - 1, day, hour, minute, second);
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) return null;
  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
}

function parseDateValue(value: unknown): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return formatDateParts(
      value.getFullYear(),
      value.getMonth() + 1,
      value.getDate(),
      value.getHours(),
      value.getMinutes(),
      value.getSeconds(),
    );
  }

  if (typeof value === "number" && value > 0) {
    const date = new Date(Date.UTC(1899, 11, 30) + value * 24 * 60 * 60 * 1000);
    return formatDateParts(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
    );
  }

  const raw = normalizeText(value);
  if (!raw) return null;
  const normalized = raw
    .replace(/[年/.]/g, "-")
    .replace(/月/g, "-")
    .replace(/日/g, "")
    .replace(/T/g, " ")
    .trim();
  const match = normalized.match(
    /^(\d{2,4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):([0-9]{1,2})(?::([0-9]{1,2}))?)?$/,
  );
  if (match) {
    const year = Number(match[1].length === 2 ? `20${match[1]}` : match[1]);
    return formatDateParts(
      year,
      Number(match[2]),
      Number(match[3]),
      Number(match[4] ?? 0),
      Number(match[5] ?? 0),
      Number(match[6] ?? 0),
    );
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return formatDateParts(
    parsed.getFullYear(),
    parsed.getMonth() + 1,
    parsed.getDate(),
    parsed.getHours(),
    parsed.getMinutes(),
    parsed.getSeconds(),
  );
}

function normalizeOrderId(value: unknown) {
  const normalized = normalizeText(value);
  return normalized || null;
}

function detectType(direction: string, category: string): TransactionType {
  const combined = `${direction}${category}`;
  if (/(转账|转出|转账红包)/.test(combined)) return "TRANSFER";
  if (/(收入|收款|入账|转入)/.test(direction)) return "INCOME";
  return "EXPENSE";
}

const STARK_EXPORT_HEADERS = ["流水ID", "日期", "类型", "平台", "金额"] as const;

function hasStarkExportHeaders(headers: string[]) {
  const normalized = new Set(headers.map(normalizeHeader));
  return STARK_EXPORT_HEADERS.every((header) => normalized.has(normalizeHeader(header)));
}

function detectStarkExportType(value: string): TransactionType | null {
  const normalized = normalizeHeader(value).toUpperCase();
  if (normalized === "收入" || normalized === "INCOME") return "INCOME";
  if (normalized === "支出" || normalized === "EXPENSE") return "EXPENSE";
  if (normalized === "转账" || normalized === "TRANSFER") return "TRANSFER";
  if (normalized === "还款" || normalized === "REPAYMENT") return "REPAYMENT";
  return null;
}

function platformHeaders(platform: BillPlatform) {
  return platform === "微信"
    ? {
        date: ["交易时间", "交易日期", "支付时间"],
        amount: ["金额(元)", "金额（元）", "金额/元", "交易金额", "金额"],
        direction: ["收/支", "收支", "收入/支出"],
        merchant: ["交易对方", "商户名称", "收款方", "交易方", "对方名称"],
        category: ["交易类型", "分类", "支付类型", "交易分类"],
        goods: ["商品", "商品说明", "商品名称", "商品描述", "交易内容"],
        remark: ["备注", "附加信息"],
        payment: ["支付方式", "付款方式", "收/付款方式"],
        status: ["当前状态", "交易状态", "状态"],
        orderId: ["交易单号", "交易订单号", "商户单号", "商家订单号"],
      }
    : {
        date: ["交易创建时间", "交易时间", "付款时间", "交易修改时间"],
        amount: ["金额（元）", "金额(元)", "交易金额", "金额"],
        direction: ["收/支", "收支", "收入/支出", "资金状态"],
        merchant: ["交易对方", "对方账号", "商户名称", "对方名称"],
        category: ["交易分类", "类型", "交易类型", "分类"],
        goods: ["商品说明", "商品名称", "商品", "商品描述", "交易内容"],
        remark: ["备注", "附加信息"],
        payment: ["收/付款方式", "支付方式", "付款方式"],
        status: ["交易状态", "当前状态", "状态"],
        orderId: ["交易号", "交易订单号", "交易单号", "商家订单号", "商户单号"],
      };
}

function normalizeRows(rows: BillRecord[], platform: BillPlatform): BillImportRow[] {
  if (!rows.length) return [];
  const headers = Object.keys(rows[0]);
  const fields = platformHeaders(platform);
  const hasDate = headerIndex(headers, fields.date) >= 0;
  const hasAmount = headerIndex(headers, fields.amount) >= 0;
  if (!hasDate || !hasAmount) return [];

  return rows.flatMap((row) => {
    const amount = parseAmount(valueAt(row, headers, fields.amount));
    const date = parseDateValue(valueAt(row, headers, fields.date));
    if (!Number.isFinite(amount) || amount <= 0 || !date) return [];

    const direction = valueAt(row, headers, fields.direction);
    const category = valueAt(row, headers, fields.category);
    const type = detectType(direction, category);
    const merchant = valueAt(row, headers, fields.merchant) || null;
    const goods = valueAt(row, headers, fields.goods);
    const remark = valueAt(row, headers, fields.remark);
    const description = [goods, remark].filter(Boolean).join(" - ") || null;

    return [{
      amount,
      type,
      category: category || (type === "INCOME" ? "收入" : type === "TRANSFER" ? "转账" : "其他"),
      platform,
      merchant,
      date,
      description,
      paymentMethod: valueAt(row, headers, fields.payment) || null,
      status: valueAt(row, headers, fields.status) || null,
      orderId: normalizeOrderId(valueAt(row, headers, fields.orderId)),
    }];
  });
}

function normalizeStarkExportRows(rows: BillRecord[]): BillImportRow[] {
  if (!rows.length) return [];
  const headers = Object.keys(rows[0]);
  if (!hasStarkExportHeaders(headers)) return [];

  return rows.flatMap((row) => {
    const amount = parseAmount(valueAt(row, headers, ["金额"]));
    const date = parseDateValue(valueAt(row, headers, ["日期"]));
    const type = detectStarkExportType(valueAt(row, headers, ["类型"]));
    if (!Number.isFinite(amount) || amount <= 0 || !date || !type) return [];

    return [{
      amount,
      type,
      category: valueAt(row, headers, ["分类"]) || (type === "INCOME" ? "收入" : type === "TRANSFER" ? "转账" : type === "REPAYMENT" ? "还款" : "其他"),
      remarkCategory: valueAt(row, headers, ["备注归类"]) || null,
      platform: valueAt(row, headers, ["平台"]) || "其他",
      merchant: valueAt(row, headers, ["商户"]) || null,
      date,
      description: valueAt(row, headers, ["说明"]) || null,
      paymentMethod: valueAt(row, headers, ["支付方式"]) || null,
      status: valueAt(row, headers, ["状态"]) || null,
      orderId: normalizeOrderId(valueAt(row, headers, ["订单号"])),
    }];
  });
}

function recordsFromCsv(content: string): BillRecord[] {
  const records = parseCsvRecords(content.replace(/^﻿/, ""));
  return recordsFromCells(records);
}

function recordsFromCells(records: unknown[][]): BillRecord[] {
  const headerIndexInRecords = records.findIndex((record) => {
    const headers = record.map((cell) => normalizeHeader(normalizeText(cell)));
    return hasStarkExportHeaders(headers) || (
      headers.some((header) => /交易时间|交易日期|交易创建时间/.test(header))
      && headers.some((header) => /金额/.test(header))
    );
  });
  if (headerIndexInRecords < 0) return [];
  const headers = records[headerIndexInRecords].map((header) => normalizeText(header).replace(/^﻿/, "").trim());
  return records.slice(headerIndexInRecords + 1).map((cells) =>
    Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])),
  );
}

function recordsFromWorkbook(sheet: XLSX.WorkSheet): BillRecord[] {
  const cells = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: true });
  return recordsFromCells(cells);
}

function hasExactHeaderMarker(source: string, marker: string) {
  const normalized = source.replace(/[\r\n]/g, ",").split(",").map(normalizeHeader);
  return normalized.includes(marker);
}

function detectRowsPlatform(rows: BillRecord[], filename = ""): BillImportSource {
  const headers = rows.slice(0, 3).flatMap((row) => Object.keys(row).map(normalizeHeader));
  if (hasStarkExportHeaders(headers)) return "本应用导出";
  const source = `${filename}\n${headers.join(",")}`;
  return source.includes("支付宝") || headers.includes("交易创建时间") || headers.includes("交易号")
    ? "支付宝"
    : "微信";
}

export function detectBillPlatform(content: string, filename = ""): BillImportSource {
  const source = `${filename}\n${content.slice(0, 1200)}`;
  const headers = source.replace(/[\r\n]/g, ",").split(",").map(normalizeHeader);
  if (hasStarkExportHeaders(headers)) return "本应用导出";
  return source.includes("支付宝")
    || source.includes("交易创建时间")
    || hasExactHeaderMarker(source, "交易号")
    ? "支付宝"
    : "微信";
}

export function parseWechatBillCsv(content: string) {
  return normalizeRows(recordsFromCsv(content), "微信");
}

export function parseAlipayBillCsv(content: string) {
  return normalizeRows(recordsFromCsv(content), "支付宝");
}

export function parseStarkExportCsv(content: string) {
  return normalizeStarkExportRows(recordsFromCsv(content));
}

export function parseBillCsv(content: string, platform = detectBillPlatform(content)) {
  const detected = detectBillPlatform(content);
  if (platform === "本应用导出") {
    return detected === "本应用导出" ? parseStarkExportCsv(content) : [];
  }
  if (detected === "本应用导出") return [];
  const hasPlatformMarker = /微信|支付宝|交易创建时间|交易号/.test(content.slice(0, 1200));
  if (hasPlatformMarker && detected !== platform) return [];
  return platform === "支付宝" ? parseAlipayBillCsv(content) : parseWechatBillCsv(content);
}

function decodeCsv(bytes: Uint8Array) {
  const utf8 = new TextDecoder("utf-8").decode(bytes);
  return utf8.includes("�") ? new TextDecoder("gb18030").decode(bytes) : utf8;
}

export async function detectBillFilePlatform(file: File): Promise<BillImportSource> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (/\.csv$/i.test(file.name)) return detectBillPlatform(decodeCsv(bytes), file.name);
  const workbook = XLSX.read(bytes, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = recordsFromWorkbook(sheet);
  return detectRowsPlatform(rows, file.name);
}

export async function parseBillFile(file: File, platform?: BillImportSource): Promise<BillImportRow[]> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let detected: BillImportSource;
  let rows: BillImportRow[];

  if (/\.csv$/i.test(file.name)) {
    const content = decodeCsv(bytes);
    detected = detectBillPlatform(content, file.name);
    rows = parseBillCsv(content, platform ?? detected);
  } else if (/\.(xls|xlsx)$/i.test(file.name)) {
    const workbook = XLSX.read(bytes, { type: "array", cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = recordsFromWorkbook(sheet);
    detected = detectRowsPlatform(rawRows, file.name);
    const source = platform ?? detected;
    rows = source === "本应用导出" ? normalizeStarkExportRows(rawRows) : normalizeRows(rawRows, source);
  } else {
    return [];
  }

  return platform && detected !== platform ? [] : rows;
}
