import type { TransactionType } from "@/lib/stark/models";

export type BillPlatform = "微信" | "支付宝";

export type BillImportRow = {
  amount: number;
  type: TransactionType;
  category: string;
  platform: BillPlatform;
  merchant: string | null;
  date: string;
  description: string | null;
  paymentMethod: string | null;
  status: string | null;
};

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function headerIndex(headers: string[], names: string[]) {
  return headers.findIndex((header) => names.some((name) => header.includes(name)));
}

function valueAt(cells: string[], index: number) {
  return index >= 0 ? cells[index]?.trim() ?? "" : "";
}

function normalizeDate(value: string) {
  const normalized = value.replace(/\//g, "-").trim();
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/.test(normalized)) return `${normalized}:00`;
  return normalized;
}

export function detectBillPlatform(content: string, filename = ""): BillPlatform {
  const source = `${filename}\n${content.slice(0, 600)}`;
  return source.includes("支付宝") ? "支付宝" : "微信";
}

export function parseBillCsv(content: string, platform = detectBillPlatform(content)): BillImportRow[] {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  const headerLineIndex = lines.findIndex((line) => {
    const cells = parseCsvLine(line);
    return cells.some((cell) => cell.includes("交易时间")) && cells.some((cell) => cell.includes("金额"));
  });
  if (headerLineIndex < 0) return [];

  const headers = parseCsvLine(lines[headerLineIndex]).map((item) => item.replace(/\s/g, ""));
  const dateIndex = headerIndex(headers, ["交易时间", "交易创建时间"]);
  const amountIndex = headerIndex(headers, ["金额(元)", "金额（元）", "交易金额", "金额"]);
  const directionIndex = headerIndex(headers, ["收/支", "收支", "资金状态"]);
  const merchantIndex = headerIndex(headers, ["交易对方", "对方名称", "商户名称"]);
  const descriptionIndex = headerIndex(headers, ["商品说明", "商品名称", "交易内容"]);
  const categoryIndex = headerIndex(headers, ["交易类型", "交易分类", "分类"]);
  const paymentIndex = headerIndex(headers, ["支付方式", "收/付款方式", "付款方式"]);
  const statusIndex = headerIndex(headers, ["当前状态", "交易状态", "状态"]);

  return lines.slice(headerLineIndex + 1).flatMap((line) => {
    const cells = parseCsvLine(line);
    const rawAmount = valueAt(cells, amountIndex).replace(/[¥￥,\s]/g, "");
    const amount = Math.abs(Number(rawAmount));
    const date = normalizeDate(valueAt(cells, dateIndex));
    if (!Number.isFinite(amount) || amount <= 0 || !date) return [];

    const direction = valueAt(cells, directionIndex);
    const type: TransactionType = direction.includes("收入") || direction === "收"
      ? "INCOME"
      : direction.includes("转账")
        ? "TRANSFER"
        : "EXPENSE";
    const merchant = valueAt(cells, merchantIndex) || null;
    const description = valueAt(cells, descriptionIndex) || null;
    const rawCategory = valueAt(cells, categoryIndex);

    return [{
      amount,
      type,
      category: rawCategory || description || (type === "INCOME" ? "收入" : "其他"),
      platform,
      merchant,
      date,
      description,
      paymentMethod: valueAt(cells, paymentIndex) || null,
      status: valueAt(cells, statusIndex) || null,
    }];
  });
}
