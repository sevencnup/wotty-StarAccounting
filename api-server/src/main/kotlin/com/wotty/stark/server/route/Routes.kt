package com.wotty.stark.server.route

import io.ktor.server.routing.*

fun Routing.userRoutes() {
    // GET /api/user/me - 获取当前用户
    // POST /api/user - 创建/保存用户
}

fun Routing.accountRoutes() {
    // GET /api/accounts - 获取账本列表
    // GET /api/accounts/{id} - 获取单个账本
    // POST /api/accounts - 创建/更新账本
    // DELETE /api/accounts/{id} - 删除账本
}

fun Routing.transactionRoutes() {
    // GET /api/transactions?accountId=&page=&pageSize= - 分页查询交易
    // GET /api/transactions/{id} - 获取单笔交易
    // POST /api/transactions - 创建交易
    // PUT /api/transactions/{id} - 更新交易
    // DELETE /api/transactions/{id} - 删除交易
    // POST /api/transactions/import - 批量导入
}

fun Routing.assetRoutes() {
    // GET /api/assets?accountId= - 资产列表
    // POST /api/assets - 创建/更新资产
    // DELETE /api/assets/{id} - 删除资产
}

fun Routing.budgetRoutes() {
    // GET /api/budgets?accountId= - 预算列表
    // POST /api/budgets - 创建/更新预算
    // DELETE /api/budgets/{id} - 删除预算
}

fun Routing.loanRoutes() {
    // GET /api/loans?accountId= - 贷款列表
    // POST /api/loans - 创建/更新贷款
    // DELETE /api/loans/{id} - 删除贷款
}

fun Routing.savingsRoutes() {
    // GET /api/savings-goals?accountId= - 储蓄目标列表
    // POST /api/savings-goals - 创建/更新储蓄目标
    // DELETE /api/savings-goals/{id} - 删除储蓄目标
    // GET /api/savings-plans?goalId= - 储蓄计划列表
    // POST /api/savings-plans - 创建/更新储蓄计划
}

fun Routing.categoryRuleRoutes() {
    // GET /api/category-rules?accountId= - 分类规则列表
    // POST /api/category-rules - 创建/更新分类规则
}

fun Routing.importErrorRoutes() {
    // GET /api/import-errors?accountId= - 导入错误列表
    // POST /api/import-errors - 创建导入错误
}

fun Routing.exchangeRateRoutes() {
    // GET /api/exchange-rates - 汇率列表
}

fun Routing.themeConfigRoutes() {
    // GET /api/theme-config/{userId} - 获取主题配置
    // PUT /api/theme-config - 更新主题配置
}
