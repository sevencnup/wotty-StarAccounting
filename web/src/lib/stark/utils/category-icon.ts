import type { Transaction } from "@/lib/stark/models";

export function categoryIconSrc(item: Transaction): string {
  const text = `${item.merchant || ""}${item.description || ""}${item.category}`;
  if (item.type === "INCOME") return "/category-icons/jiaoyi.png";
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