SET NAMES utf8mb4;
USE star_accounting;

INSERT INTO `user` (`id`, `email`, `password`, `name`, `defaultAccountId`, `createdAt`, `updatedAt`, `role`)
VALUES
  ('local-user', 'cloud@wotty.stark', '', '云端演示用户', 'default', '2026-07-31 15:10:00', '2026-07-31 15:10:00', 'USER')
ON DUPLICATE KEY UPDATE
  `email` = VALUES(`email`),
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `defaultAccountId` = VALUES(`defaultAccountId`),
  `updatedAt` = VALUES(`updatedAt`),
  `role` = VALUES(`role`);

INSERT INTO `account` (`id`, `name`, `ownerId`, `createdAt`, `updatedAt`)
VALUES
  ('default', '云端默认账本', 'local-user', '2026-07-31 15:10:00', '2026-07-31 15:10:00')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `ownerId` = VALUES(`ownerId`),
  `updatedAt` = VALUES(`updatedAt`);

DELETE FROM `transaction`
WHERE `id` IN (
  'txn-salary', 'txn-food', 'txn-shop',
  'txn-2026-06-salary', 'txn-2026-06-rent', 'txn-2026-06-food', 'txn-2026-06-metro',
  'txn-2026-07-salary', 'txn-2026-07-bonus', 'txn-2026-07-breakfast', 'txn-2026-07-lunch',
  'txn-2026-07-metro', 'txn-2026-07-gas', 'txn-2026-07-jd', 'txn-2026-07-movie',
  'txn-2026-07-clinic', 'txn-2026-07-home', 'txn-2026-07-loan', 'txn-2026-07-trip'
);

INSERT INTO `transaction` (
  `id`, `userId`, `accountId`, `amount`, `type`, `category`, `platform`, `merchant`, `date`,
  `description`, `orderId`, `paymentMethod`, `status`, `loanId`, `createdAt`, `updatedAt`
)
VALUES
  ('txn-2026-06-salary', 'local-user', 'default', 12800, 'INCOME', '工资', '银行卡', '公司发薪', '2026-06-15 09:00:00', '上月工资', NULL, NULL, NULL, NULL, '2026-06-15 09:00:00', '2026-06-15 09:00:00'),
  ('txn-2026-06-rent', 'local-user', 'default', 3200, 'EXPENSE', '住房家居', '银行卡', '房租', '2026-06-16 10:00:00', '六月房租', NULL, NULL, NULL, NULL, '2026-06-16 10:00:00', '2026-06-16 10:00:00'),
  ('txn-2026-06-food', 'local-user', 'default', 980, 'EXPENSE', '餐饮美食', '支付宝', '日常餐饮', '2026-06-20 19:00:00', '六月餐饮汇总', NULL, NULL, NULL, NULL, '2026-06-20 19:00:00', '2026-06-20 19:00:00'),
  ('txn-2026-06-metro', 'local-user', 'default', 240, 'EXPENSE', '交通出行', '支付宝', '地铁公交', '2026-06-28 08:30:00', '六月通勤', NULL, NULL, NULL, NULL, '2026-06-28 08:30:00', '2026-06-28 08:30:00'),
  ('txn-2026-07-salary', 'local-user', 'default', 12800, 'INCOME', '工资', '银行卡', '公司发薪', '2026-07-15 09:00:00', '月中发薪', NULL, NULL, NULL, NULL, '2026-07-15 09:00:00', '2026-07-15 09:00:00'),
  ('txn-2026-07-bonus', 'local-user', 'default', 2200, 'INCOME', '奖金', '银行卡', '绩效奖金', '2026-07-26 18:00:00', '月度绩效', NULL, NULL, NULL, NULL, '2026-07-26 18:00:00', '2026-07-26 18:00:00'),
  ('txn-2026-07-breakfast', 'local-user', 'default', 24, 'EXPENSE', '餐饮美食', '支付宝', '便利店早餐', '2026-07-16 08:05:00', '上班早餐', NULL, NULL, NULL, NULL, '2026-07-16 08:05:00', '2026-07-16 08:05:00'),
  ('txn-2026-07-lunch', 'local-user', 'default', 88, 'EXPENSE', '餐饮美食', '支付宝', '工作日午餐', '2026-07-16 12:20:00', '商务午餐', NULL, NULL, NULL, NULL, '2026-07-16 12:20:00', '2026-07-16 12:20:00'),
  ('txn-2026-07-metro', 'local-user', 'default', 180, 'EXPENSE', '交通出行', '支付宝', '地铁公交', '2026-07-18 08:10:00', '本月通勤', NULL, NULL, NULL, NULL, '2026-07-18 08:10:00', '2026-07-18 08:10:00'),
  ('txn-2026-07-gas', 'local-user', 'default', 420, 'EXPENSE', '交通出行', '微信', '中石化', '2026-07-19 19:30:00', '周末加油', NULL, NULL, NULL, NULL, '2026-07-19 19:30:00', '2026-07-19 19:30:00'),
  ('txn-2026-07-jd', 'local-user', 'default', 1268, 'EXPENSE', '购物消费', '京东', '京东商城', '2026-07-20 21:16:00', '家电和日用品', 'JD-20260720-001', '在线支付', 'PAID', NULL, '2026-07-20 21:16:00', '2026-07-20 21:16:00'),
  ('txn-2026-07-movie', 'local-user', 'default', 156, 'EXPENSE', '休闲娱乐', '微信', '万达影城', '2026-07-22 20:40:00', '周末观影', NULL, NULL, NULL, NULL, '2026-07-22 20:40:00', '2026-07-22 20:40:00'),
  ('txn-2026-07-clinic', 'local-user', 'default', 305, 'EXPENSE', '医疗健康', '支付宝', '社区门诊', '2026-07-24 14:10:00', '感冒就诊', NULL, NULL, NULL, NULL, '2026-07-24 14:10:00', '2026-07-24 14:10:00'),
  ('txn-2026-07-home', 'local-user', 'default', 899, 'EXPENSE', '住房家居', '微信', '宜家家居', '2026-07-25 16:35:00', '家居置物', NULL, NULL, NULL, NULL, '2026-07-25 16:35:00', '2026-07-25 16:35:00'),
  ('txn-2026-07-loan', 'local-user', 'default', 3200, 'EXPENSE', '房贷还款', '银行卡', '中国银行房贷', '2026-07-20 09:30:00', '本月房贷', NULL, NULL, 'PAID', 'loan-home', '2026-07-20 09:30:00', '2026-07-20 09:30:00'),
  ('txn-2026-07-trip', 'local-user', 'default', 520, 'EXPENSE', '旅行度假', '支付宝', '高铁出行', '2026-07-28 11:20:00', '短途出游交通', NULL, NULL, NULL, NULL, '2026-07-28 11:20:00', '2026-07-28 11:20:00');

DELETE FROM `asset`
WHERE `id` IN ('asset-bank', 'asset-wechat');

INSERT INTO `asset` (`id`, `userId`, `accountId`, `name`, `type`, `balance`, `currency`, `createdAt`, `updatedAt`)
VALUES
  ('asset-bank-main', 'local-user', 'default', '工资卡', 'BANK_CARD', 48216.40, 'CNY', '2026-07-31 15:10:00', '2026-07-31 15:10:00'),
  ('asset-wechat-main', 'local-user', 'default', '微信钱包', 'WECHAT', 1260.50, 'CNY', '2026-07-31 15:10:00', '2026-07-31 15:10:00'),
  ('asset-alipay-main', 'local-user', 'default', '支付宝余额', 'ALIPAY', 3688.90, 'CNY', '2026-07-31 15:10:00', '2026-07-31 15:10:00')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `type` = VALUES(`type`),
  `balance` = VALUES(`balance`),
  `currency` = VALUES(`currency`),
  `updatedAt` = VALUES(`updatedAt`);

INSERT INTO `budget` (`id`, `userId`, `accountId`, `amount`, `category`, `period`, `createdAt`, `updatedAt`, `alertPercent`, `platform`, `scopeType`)
VALUES
  ('budget-global', 'local-user', 'default', 9000, 'ALL', 'MONTHLY', '2026-07-31 15:10:00', '2026-07-31 15:10:00', 80, NULL, 'GLOBAL'),
  ('budget-food', 'local-user', 'default', 1800, '餐饮美食', 'MONTHLY', '2026-07-31 15:10:00', '2026-07-31 15:10:00', 85, NULL, 'CATEGORY'),
  ('budget-shopping', 'local-user', 'default', 1600, '购物消费', 'MONTHLY', '2026-07-31 15:10:00', '2026-07-31 15:10:00', 90, NULL, 'CATEGORY')
ON DUPLICATE KEY UPDATE
  `amount` = VALUES(`amount`),
  `category` = VALUES(`category`),
  `period` = VALUES(`period`),
  `updatedAt` = VALUES(`updatedAt`),
  `alertPercent` = VALUES(`alertPercent`),
  `platform` = VALUES(`platform`),
  `scopeType` = VALUES(`scopeType`);

INSERT INTO `loan` (`id`, `userId`, `accountId`, `platform`, `totalAmount`, `remainingAmount`, `periods`, `paidPeriods`, `monthlyPayment`, `dueDate`, `status`, `matchKeywords`, `createdAt`, `updatedAt`)
VALUES
  ('loan-home', 'local-user', 'default', '房贷', 480000, 352000, 240, 64, 3200, 20, 'ACTIVE', NULL, '2026-07-31 15:10:00', '2026-07-31 15:10:00'),
  ('loan-car', 'local-user', 'default', '车贷', 98000, 21600, 48, 34, 2800, 12, 'ACTIVE', NULL, '2026-07-31 15:10:00', '2026-07-31 15:10:00')
ON DUPLICATE KEY UPDATE
  `platform` = VALUES(`platform`),
  `totalAmount` = VALUES(`totalAmount`),
  `remainingAmount` = VALUES(`remainingAmount`),
  `periods` = VALUES(`periods`),
  `paidPeriods` = VALUES(`paidPeriods`),
  `monthlyPayment` = VALUES(`monthlyPayment`),
  `dueDate` = VALUES(`dueDate`),
  `status` = VALUES(`status`),
  `matchKeywords` = VALUES(`matchKeywords`),
  `updatedAt` = VALUES(`updatedAt`);

INSERT INTO `savingsgoal` (`id`, `userId`, `accountId`, `name`, `targetAmount`, `currentAmount`, `deadline`, `type`, `status`, `createdAt`, `updatedAt`, `depositType`, `planConfig`)
VALUES
  ('goal-travel', 'local-user', 'default', '旅行基金', 30000, 9200, '2026-12-31 00:00:00', 'LONG_TERM', 'ACTIVE', '2026-07-31 15:10:00', '2026-07-31 15:10:00', 'CASH', NULL),
  ('goal-emergency', 'local-user', 'default', '应急储备', 50000, 18600, '2027-06-30 00:00:00', 'LONG_TERM', 'ACTIVE', '2026-07-31 15:10:00', '2026-07-31 15:10:00', 'CASH', NULL)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `targetAmount` = VALUES(`targetAmount`),
  `currentAmount` = VALUES(`currentAmount`),
  `deadline` = VALUES(`deadline`),
  `type` = VALUES(`type`),
  `status` = VALUES(`status`),
  `updatedAt` = VALUES(`updatedAt`),
  `depositType` = VALUES(`depositType`),
  `planConfig` = VALUES(`planConfig`);

INSERT INTO `savingsplan` (`id`, `goalId`, `amount`, `status`, `month`, `createdAt`, `updatedAt`, `expenses`, `remark`, `salary`, `proofImage`)
VALUES
  ('plan-travel-2026-07', 'goal-travel', 2000, 'COMPLETED', '2026-07', '2026-07-31 15:10:00', '2026-07-31 15:10:00', NULL, '七月已补充旅行基金', 12800, NULL),
  ('plan-emergency-2026-08', 'goal-emergency', 3000, 'PENDING', '2026-08', '2026-07-31 15:10:00', '2026-07-31 15:10:00', NULL, '八月发薪后补入', 12800, NULL)
ON DUPLICATE KEY UPDATE
  `goalId` = VALUES(`goalId`),
  `amount` = VALUES(`amount`),
  `status` = VALUES(`status`),
  `month` = VALUES(`month`),
  `updatedAt` = VALUES(`updatedAt`),
  `expenses` = VALUES(`expenses`),
  `remark` = VALUES(`remark`),
  `salary` = VALUES(`salary`),
  `proofImage` = VALUES(`proofImage`);

INSERT INTO `transactioncategoryrule` (`id`, `userId`, `accountId`, `name`, `merchant`, `merchantKey`, `category`, `description`, `isActive`, `createdAt`, `updatedAt`)
VALUES
  ('rule-starbucks', 'local-user', 'default', '咖啡店归类', '星巴克', 'starbucks', '餐饮美食', '咖啡饮品自动归类到餐饮', TRUE, '2026-07-31 15:10:00', '2026-07-31 15:10:00'),
  ('rule-metro', 'local-user', 'default', '地铁公交归类', '地铁公交', 'metro', '交通出行', '公共交通统一归类', TRUE, '2026-07-31 15:10:00', '2026-07-31 15:10:00'),
  ('rule-jd', 'local-user', 'default', '京东归类', '京东商城', 'jd', '购物消费', '电商购物自动归类', TRUE, '2026-07-31 15:10:00', '2026-07-31 15:10:00')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `merchant` = VALUES(`merchant`),
  `merchantKey` = VALUES(`merchantKey`),
  `category` = VALUES(`category`),
  `description` = VALUES(`description`),
  `isActive` = VALUES(`isActive`),
  `updatedAt` = VALUES(`updatedAt`);

INSERT INTO `importerrorlog` (`id`, `userId`, `accountId`, `fileName`, `lineNumber`, `rawData`, `errorMessage`, `errorType`, `resolved`, `createdAt`)
VALUES
  ('import-cmb-001', 'local-user', 'default', 'cmb-2026-07.csv', 14, '2026-07-18,???,1,268.00', '商户名称缺失，需手动确认分类', 'MISSING_MERCHANT', FALSE, '2026-07-31 15:10:00')
ON DUPLICATE KEY UPDATE
  `fileName` = VALUES(`fileName`),
  `lineNumber` = VALUES(`lineNumber`),
  `rawData` = VALUES(`rawData`),
  `errorMessage` = VALUES(`errorMessage`),
  `errorType` = VALUES(`errorType`),
  `resolved` = VALUES(`resolved`),
  `createdAt` = VALUES(`createdAt`);

INSERT INTO `exchangerate` (`id`, `from`, `to`, `rate`, `updatedAt`)
VALUES
  ('fx-cny-usd', 'CNY', 'USD', 0.1392, '2026-07-31 15:10:00')
ON DUPLICATE KEY UPDATE
  `from` = VALUES(`from`),
  `to` = VALUES(`to`),
  `rate` = VALUES(`rate`),
  `updatedAt` = VALUES(`updatedAt`);

INSERT INTO `themeconfig` (`id`, `userId`, `accountId`, `themeId`, `primaryColor`, `radius`, `isDarkMode`, `chartStyle`, `createdAt`, `updatedAt`)
VALUES
  ('theme-default', 'local-user', 'default', 'prime', '#3d86ff', 20, FALSE, '{"line":"soft","pie":"ring"}', '2026-07-31 15:10:00', '2026-07-31 15:10:00')
ON DUPLICATE KEY UPDATE
  `accountId` = VALUES(`accountId`),
  `themeId` = VALUES(`themeId`),
  `primaryColor` = VALUES(`primaryColor`),
  `radius` = VALUES(`radius`),
  `isDarkMode` = VALUES(`isDarkMode`),
  `chartStyle` = VALUES(`chartStyle`),
  `updatedAt` = VALUES(`updatedAt`);
