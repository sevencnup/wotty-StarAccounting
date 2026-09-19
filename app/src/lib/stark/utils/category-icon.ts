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
  美容: "gerenhuli-optimized.webp",
  宠物: "chongwu-optimized.webp",
  通讯: "dianzilei.webp",
  运动: "jianshenlei.webp",
  旅行: "chuxinglei.webp",
  教育: "jiaoyulei.webp",
  工资: "gongjulei.webp",
  奖金: "wanju.webp",
  理财: "jiajulei1.webp",
  转账: "dianzilei.webp",
  还款: "gongjulei.webp",
  其他: "xianshi.webp",
  宝宝: "baobaolei.webp",
  宝宝用品: "baobaolei.webp",
  充电: "chongdian-optimized.webp",
  出行: "chuxinglei.webp",
  打印: "dayin-optimized.webp",
  电费: "dianfei-optimized.webp",
  电子产品: "dianzichanp-optimized.webp",
  电子设备: "dianzishebei.webp",
  工具: "xiaogongju-optimized.webp",
  公共出行: "gongongchuxing.webp",
  户外: "huwai.webp",
  个人护理: "gerenhuli-optimized.webp",
  家具: "jiajulei.webp",
  家电: "jiajulei1.webp",
  健身: "jianshen-optimized.webp",
  健身训练: "jianshen-optimized (1).webp",
  教育培训: "jiaoyulei.webp",
  酒类: "jiulei.webp",
  加油: "jiayou-optimized.webp",
  理发: "lifa-optimized.webp",
  旅游: "lvyou-optimized.webp",
  门诊: "menz-optimized.webp",
  摩托车: "motuo.webp",
  牛奶: "niunai.webp",
  汽车: "qichelei.webp",
  清洁: "qingjie.webp",
  清洁优化: "qingjie-optimized.webp",
  燃气: "ranqi.webp",
  日常清洁: "richangqingjie-optimized.webp",
  肉类: "roulei.webp",
  生活用品: "shenghuoyongzhi-optimized.webp",
  水产: "shuicanlei.webp",
  水费: "shuifei.webp",
  水果: "shuiguo.webp",
  糖果: "tangguo.webp",
  甜品: "tianpinlei.webp",
  停车费: "tingchefei-optimized.webp",
  体育: "tiyulei.webp",
  图书: "tushulei.webp",
  玩偶: "wanju.webp",
  玩具: "wanju.webp",
  闲食: "xianshi.webp",
  鲜食: "xianshi.webp",
  下午茶: "xiawucha.webp",
  小工具: "xiaogongju-optimized.webp",
  鞋类: "xielei.webp",
  烟草: "yancaplei.webp",
  药品: "yaopin.webp",
  医疗优化: "yiliao-optimized.webp",
  婴儿: "yinger-optimized.webp",
  婴儿用品: "yingerlei.webp",
  影音: "yingyinlei.webp",
  饮品: "niunai.webp",
  游戏: "youxilei.webp",
  花圃: "zhiwu.webp",
  植物: "zhiwu.webp",
  装修: "zhuangxiulei.webp",
  自行车: "zixingche.webp",
  网费: "wangfei-optimized.webp",
};

const nonExpenseCategories = new Set(["工资", "奖金", "理财", "转账", "还款"]);
const hiddenExpenseCategories = new Set([
  "公共出行",
  "电子设备",
  "宝宝",
  "汽车",
  "自行车",
  "婴儿",
  "宝宝用品",
  "玩偶",
  "医疗优化",
  "旅行",
  "鲜食",
  "植物",
  "教育培训",
  "健身训练",
  "摩托车",
  "牛奶",
  "健身",
]);

const expenseCategoryOrder = [
  // 餐饮食品
  "餐饮", "闲食", "水果", "肉类", "水产", "糖果", "甜品", "下午茶", "饮品", "酒类", "烟草",
  // 购物服饰与宠物
  "购物", "服装", "鞋类", "美容", "个人护理", "理发", "宠物", "玩具",
  // 交通出行
  "交通", "出行", "旅游", "加油", "停车费",
  // 住房与日用
  "住房", "家具", "家电", "装修", "水费", "电费", "燃气", "网费", "清洁", "清洁优化", "日常清洁", "日用", "生活用品",
  // 数码通讯
  "通讯", "电子产品", "影音", "充电", "打印",
  // 医疗健康
  "医疗", "药品", "门诊",
  // 运动户外
  "体育", "户外",
  // 教育与娱乐
  "教育", "图书", "娱乐", "游戏",
  // 其他
  "工具", "小工具", "花圃", "其他",
];

const orderedExpenseCategories = Array.from(new Set([
  ...expenseCategoryOrder,
  ...Object.keys(categoryIconFiles),
]));

export const expenseCategoryOptions = orderedExpenseCategories.filter(
  (category) => !nonExpenseCategories.has(category) && !hiddenExpenseCategories.has(category),
);

const incomeCategoryIcons: Record<string, string> = {
  工资: "gongjulei.webp",
  奖金: "wanju.webp",
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
  [/奖|红利|分红/, "wanju.webp"],
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
