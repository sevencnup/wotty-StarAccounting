import type { Transaction } from "@/lib/stark/models";

const categoryIconFiles: Record<string, string> = {
  餐饮: "canyinlei.webp",
  购物: "gouwulei.webp",
  交通: "gongongchuxing.webp",
  住房: "zhufang.webp",
  娱乐: "youxilei.webp",
  医疗: "yaopin.webp",
  日用: "qingjie.webp",
  服装: "fuzhuanglei.webp",
  美容: "jiajulei1.webp",
  宠物: "baobaolei.webp",
  通讯: "dianzilei.webp",
  运动: "jianshenlei.webp",
  旅行: "chuxinglei.webp",
  教育: "jiaoyulei.webp",
  工资: "gongjulei.webp",
  奖金: "wanoulei.webp",
  理财: "jiajulei1.webp",
  转账: "dianzilei.webp",
  还款: "gongjulei.webp",
  其他: "gongjulei.webp",
};

const incomeCategoryIcons: Record<string, string> = {
  工资: "gongjulei.webp",
  奖金: "wanoulei.webp",
  理财: "jiajulei1.webp",
};

const categoryKeywordIcons: Array<[RegExp, string]> = [
  [/水果/, "shuiguo.webp"],
  [/肉/, "roulei.webp"],
  [/水产|海鲜/, "shuicanlei.webp"],
  [/牛奶|乳制品/, "niunai.webp"],
  [/糖果|零食/, "tangguo.webp"],
  [/甜品|蛋糕/, "tianpinlei.webp"],
  [/下午茶/, "xiawucha.webp"],
  [/酒/, "jiulei.webp"],
  [/烟|香烟|烟草/, "yancaplei.webp"],
  [/餐|美食|咖啡/, "canyinlei.webp"],
  [/自行车|骑行/, "zixingche.webp"],
  [/摩托/, "motuo.webp"],
  [/汽车|打车|出租|自驾/, "qichelei.webp"],
  [/公交|地铁|公共出行/, "gongongchuxing.webp"],
  [/交|车/, "gongongchuxing.webp"],
  [/购|百货|超市|充值/, "gouwulei.webp"],
  [/影音|视频|电影/, "yingyinlei.webp"],
  [/娱|文化|休闲|游戏/, "youxilei.webp"],
  [/日用|生活|清洁/, "qingjie.webp"],
  [/医|健康|药/, "yaopin.webp"],
  [/水费/, "shuifei.webp"],
  [/燃气|煤气/, "ranqi.webp"],
  [/住|房|租/, "zhufang.webp"],
  [/旅/, "chuxinglei.webp"],
  [/宠/, "baobaolei.webp"],
  [/服/, "fuzhuanglei.webp"],
  [/鞋/, "xielei.webp"],
  [/通|信用卡|手机/, "dianzilei.webp"],
  [/耳机|音频/, "dianzishebei.webp"],
  [/健身|运动|体育/, "jianshenlei.webp"],
  [/户外/, "huwai.webp"],
  [/工|薪资|薪酬/, "gongjulei.webp"],
  [/奖|红利|分红/, "wanoulei.webp"],
  [/理财|投资/, "jiajulei1.webp"],
  [/教|培训/, "jiaoyulei.webp"],
  [/书|阅读/, "tushulei.webp"],
  [/转|退款|收入/, "dianzilei.webp"],
];

const fallbackCategoryIcon = "/category-icons/gongjulei.webp";

function incomeIconFile(category: string): string | null {
  const normalized = category.trim();
  if (incomeCategoryIcons[normalized]) return incomeCategoryIcons[normalized];
  if (/工|薪资|薪酬/.test(normalized)) return incomeCategoryIcons.工资;
  if (/奖|红利|分红/.test(normalized)) return incomeCategoryIcons.奖金;
  if (/理财|投资/.test(normalized)) return incomeCategoryIcons.理财;
  return null;
}

export function categoryIconSrcForCategory(category: string, type?: Transaction["type"]): string {
  if (type === "TRANSFER" || type === "REPAYMENT") {
    return `/category-icons/${categoryIconFiles[type === "TRANSFER" ? "转账" : "还款"]}`;
  }
  const normalized = category.trim();
  if (categoryIconFiles[normalized]) return `/category-icons/${categoryIconFiles[normalized]}`;
  if (type === "INCOME") {
    const incomeIcon = incomeIconFile(normalized);
    if (incomeIcon) return `/category-icons/${incomeIcon}`;
  }
  const matched = categoryKeywordIcons.find(([matcher]) => matcher.test(normalized));
  if (matched) return `/category-icons/${matched[1]}`;
  return fallbackCategoryIcon;
}

export function categoryIconSrc(item: Transaction): string {
  const text = `${item.merchant || ""}${item.description || ""}${item.category}`;
  const directIcon = categoryIconSrcForCategory(item.category, item.type);
  if (directIcon !== fallbackCategoryIcon || item.type === "INCOME") return directIcon;
  return categoryIconSrcForCategory(text, item.type);
}
