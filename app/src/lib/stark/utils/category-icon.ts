import type { Transaction } from "@/lib/stark/models";

const categoryIconFiles: Record<string, string> = {
  餐饮: "canyin.png",
  购物: "gouwu.png",
  交通: "jiaotong.png",
  住房: "zhufang.png",
  娱乐: "yule.png",
  医疗: "yiliao.png",
  日用: "riyong.png",
  服装: "fuzhuang.png",
  美容: "meirong.png",
  宠物: "chongwu.png",
  通讯: "tongxun.png",
  运动: "yundong.png",
  旅行: "lvxing.png",
  教育: "jiaoyu.png",
  工资: "gongzi.png",
  奖金: "jiangjin.png",
  理财: "licai.png",
  转账: "jiaoyi.png",
  还款: "jiaoyi.png",
  其他: "qita.png",
};

const incomeCategoryIcons: Record<string, string> = {
  工资: "gongzi.png",
  奖金: "jiangjin.png",
  理财: "licai.png",
};

const categoryKeywordIcons: Array<[RegExp, string]> = [
  [/餐|美食|咖啡/, "canyin.png"],
  [/交|车|公交|地铁/, "jiaotong.png"],
  [/购|百货|超市|充值/, "gouwu.png"],
  [/娱|文化|休闲|电影/, "yule.png"],
  [/日用|生活/, "riyong.png"],
  [/医|健康/, "yiliao.png"],
  [/住|房|租|水电/, "zhufang.png"],
  [/旅/, "lvxing.png"],
  [/美/, "meirong.png"],
  [/宠/, "chongwu.png"],
  [/服/, "fuzhuang.png"],
  [/通|信用卡/, "tongxun.png"],
  [/运/, "yundong.png"],
  [/工|薪资|薪酬/, "gongzi.png"],
  [/奖|红利|分红/, "jiangjin.png"],
  [/理财|投资/, "licai.png"],
  [/教|培训/, "jiaoyu.png"],
  [/转|退款|收入/, "qita.png"],
];

function incomeIconFile(category: string): string | null {
  const normalized = category.trim();
  if (incomeCategoryIcons[normalized]) return incomeCategoryIcons[normalized];
  if (/工|薪资|薪酬/.test(normalized)) return incomeCategoryIcons.工资;
  if (/奖|红利|分红/.test(normalized)) return incomeCategoryIcons.奖金;
  if (/理财|投资/.test(normalized)) return incomeCategoryIcons.理财;
  return null;
}

export function categoryIconSrcForCategory(category: string, type?: Transaction["type"]): string {
  if (type === "TRANSFER" || type === "REPAYMENT") return "/category-icons/jiaoyi.png";
  const normalized = category.trim();
  if (categoryIconFiles[normalized]) return `/category-icons/${categoryIconFiles[normalized]}`;
  if (type === "INCOME") {
    const incomeIcon = incomeIconFile(normalized);
    if (incomeIcon) return `/category-icons/${incomeIcon}`;
  }
  const matched = categoryKeywordIcons.find(([matcher]) => matcher.test(normalized));
  if (matched) return `/category-icons/${matched[1]}`;
  return "/category-icons/qita.png";
}

export function categoryIconSrc(item: Transaction): string {
  const text = `${item.merchant || ""}${item.description || ""}${item.category}`;
  const directIcon = categoryIconSrcForCategory(item.category, item.type);
  if (directIcon !== "/category-icons/qita.png" || item.type === "INCOME") return directIcon;
  if (text.includes("餐") || text.includes("咖啡")) return "/category-icons/canyin.png";
  if (text.includes("交") || text.includes("地铁")) return "/category-icons/jiaotong.png";
  if (text.includes("购") || text.includes("超市")) return "/category-icons/gouwu.png";
  if (text.includes("娱") || text.includes("电影")) return "/category-icons/yule.png";
  if (text.includes("生活") || text.includes("日用")) return "/category-icons/riyong.png";
  if (text.includes("医")) return "/category-icons/yiliao.png";
  if (text.includes("住") || text.includes("租")) return "/category-icons/zhufang.png";
  if (text.includes("旅")) return "/category-icons/lvxing.png";
  if (text.includes("美")) return "/category-icons/meirong.png";
  if (text.includes("宠")) return "/category-icons/chongwu.png";
  if (text.includes("服")) return "/category-icons/fuzhuang.png";
  if (text.includes("通")) return "/category-icons/tongxun.png";
  if (text.includes("运")) return "/category-icons/yundong.png";
  if (text.includes("教")) return "/category-icons/jiaoyu.png";
  return "/category-icons/qita.png";
}
