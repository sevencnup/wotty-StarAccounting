"use client";

import { useEffect, useMemo, useState } from "react";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { formatMoney, nowText } from "@/lib/stark/utils/format";
import { categoryIconSrc } from "@/lib/stark/utils/category-icon";
import { applyCategoryRule, hasRemark, matchesCategoryKeyword, REMARK_SUGGESTIONS } from "@/lib/stark/dashboard/remark";
import type { CategoryRule, Transaction } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();
const ACCOUNT_ID = "default";
const TRANSACTION_PAGE_SIZE = 200;
const WRITE_BATCH_SIZE = 50;

type RemarkFilter = "TRANSFER" | "ALL";

function timeLabel(dateStr: string) {
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function amountText(tx: Transaction) {
  const sign = tx.type === "INCOME" ? "+¥ " : tx.type === "EXPENSE" ? "-¥ " : "±¥ ";
  return `${sign}${formatMoney(tx.amount)}`;
}

function ruleKeyword(rule: CategoryRule) {
  return (rule.merchantKey || rule.merchant || "").trim();
}

function sameKeyword(left: string, right: string) {
  return left.trim().replace(/\s+/g, "").toLowerCase() === right.trim().replace(/\s+/g, "").toLowerCase();
}

async function saveInBatches(items: Transaction[]) {
  for (let index = 0; index < items.length; index += WRITE_BATCH_SIZE) {
    await Promise.all(items.slice(index, index + WRITE_BATCH_SIZE).map((item) => repo.saveTransaction(item)));
  }
}

function RemarkCategoryEditor({
  initial,
  suggestions,
  onSave,
  onCancel,
}: {
  initial: string;
  suggestions: string[];
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);

  return (
    <div className="remark-category-editor">
      <div className="remark-category-chips">
        {suggestions.map((item) => (
          <button key={item} type="button" className={value === item ? "active" : ""} onClick={() => setValue(item)}>
            {item}
          </button>
        ))}
      </div>
      <input
        className="remark-category-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="输入或选择分类，如：房租水电"
      />
      <div className="remark-category-actions">
        {initial ? <button type="button" className="remark-btn-clear" onClick={() => onSave("")}>清除归类</button> : <span />}
        <div>
          <button type="button" className="remark-btn-cancel" onClick={onCancel}>取消</button>
          <button type="button" className="remark-btn-save" disabled={!value.trim()} onClick={() => onSave(value)}>保存</button>
        </div>
      </div>
    </div>
  );
}

export function BillRemarkSheet() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRule, setSavingRule] = useState(false);
  const [ruleMessage, setRuleMessage] = useState("输入账单里的名称或关键词，例如：房东");
  const [keyword, setKeyword] = useState("");
  const [ruleCategory, setRuleCategory] = useState("房租水电");
  const [filter, setFilter] = useState<RemarkFilter>("TRANSFER");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([repo.getTransactions(ACCOUNT_ID, 1, TRANSACTION_PAGE_SIZE), repo.getCategoryRules(ACCOUNT_ID)])
      .then(([data, savedRules]) => {
        if (cancelled) return;
        setTransactions(data);
        setRules(savedRules.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setRuleMessage("账单加载失败，请稍后重试");
        }
      });
    return () => { cancelled = true; };
  }, []);

  const billList = useMemo(
    () => transactions.filter((item) => (filter === "ALL" ? item.type !== "INCOME" : item.type === "TRANSFER")),
    [filter, transactions],
  );
  const transferCount = useMemo(() => transactions.filter((item) => item.type === "TRANSFER").length, [transactions]);
  const allCount = useMemo(() => transactions.filter((item) => item.type !== "INCOME").length, [transactions]);
  const suggestions = useMemo(() => {
    const present = new Set(transactions.map((item) => item.remarkCategory || item.category).filter(Boolean));
    return [...new Set([...REMARK_SUGGESTIONS, ...present])].slice(0, 24);
  }, [transactions]);
  const previewMatches = useMemo(
    () => keyword.trim() ? transactions.filter((item) => matchesCategoryKeyword(item, keyword.trim())).length : 0,
    [keyword, transactions],
  );

  function toggleRow(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  async function saveRemark(tx: Transaction, value: string) {
    const trimmed = value.trim();
    const updated: Transaction = { ...tx, remarkCategory: trimmed || null, updatedAt: nowText() };
    await repo.saveTransaction(updated);
    setTransactions((prev) => prev.map((item) => (item.id === tx.id ? updated : item)));
    setExpandedId(null);
    window.dispatchEvent(new Event("stark:transaction-saved"));
  }

  async function saveKeywordRule() {
    const trimmedKeyword = keyword.trim();
    const trimmedCategory = ruleCategory.trim();
    if (!trimmedKeyword || !trimmedCategory || savingRule) return;

    setSavingRule(true);
    setRuleMessage("正在匹配并应用流水...");
    try {
      const allTransactions = await repo.getTransactions(ACCOUNT_ID, 1, Number.MAX_SAFE_INTEGER);

      const timestamp = nowText();
      const existing = rules.find((rule) => sameKeyword(ruleKeyword(rule), trimmedKeyword));
      const rule: CategoryRule = {
        id: existing?.id ?? crypto.randomUUID(),
        userId: existing?.userId ?? "local-user",
        accountId: ACCOUNT_ID,
        name: trimmedKeyword,
        merchant: trimmedKeyword,
        merchantKey: trimmedKeyword,
        category: trimmedCategory,
        description: `关键词：${trimmedKeyword}`,
        isActive: true,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      };
     const updatedTransactions = applyCategoryRule(allTransactions, rule);
      const changedTransactions = updatedTransactions
        .filter((item, index) => item.remarkCategory !== allTransactions[index]?.remarkCategory)
        .map((item) => ({ ...item, updatedAt: timestamp }));
      const updatedById = new Map(updatedTransactions.map((item) => [item.id, item]));

      await repo.saveCategoryRule(rule);
      await saveInBatches(changedTransactions);
      setRules((prev) => [rule, ...prev.filter((item) => item.id !== rule.id)].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
      setTransactions((prev) => prev.map((item) => updatedById.get(item.id) ?? item));
      setKeyword("");
      setRuleMessage(`已应用到 ${changedTransactions.length} 笔流水，后续导入同名账单也会自动归类`);
      window.dispatchEvent(new Event("stark:transaction-saved"));
    } catch {
      setRuleMessage("规则保存失败，请检查当前数据源是否可用");
    } finally {
      setSavingRule(false);
    }
  }

  async function toggleRule(rule: CategoryRule) {
    const updated = { ...rule, isActive: !rule.isActive, updatedAt: nowText() };
    await repo.saveCategoryRule(updated);
    setRules((prev) => prev.map((item) => (item.id === rule.id ? updated : item)));
  }

  async function deleteRule(rule: CategoryRule) {
    if (!window.confirm(`确定删除“${ruleKeyword(rule)}”规则吗？已归类的流水不会被清除。`)) return;
    await repo.deleteCategoryRule(rule.id, ACCOUNT_ID);
    setRules((prev) => prev.filter((item) => item.id !== rule.id));
  }

  return (
    <div className="bill-remark-sheet">
      <p className="settings-sheet-note">给转账等账单指定消费分类，归类后将按该分类计入消费支出的统计与分析。</p>
      <section className="category-rule-composer">
        <div className="category-rule-heading">
          <div><span>关键词归类</span><small>一次匹配同名流水</small></div>
          <span className="category-rule-badge">自动规则</span>
        </div>
        <label className="category-rule-field">
          <span>账单关键词</span>
          <input value={keyword} onChange={(event) => { setKeyword(event.target.value); setRuleMessage("输入账单里的名称或关键词，例如：房东"); }} placeholder="例如：房东、张三、某某物业" autoComplete="off" />
        </label>
        <div className="category-rule-example">会匹配交易对方、商品说明、备注、平台、支付方式和订单号</div>
        <div className="category-rule-field">
          <span>归入消费分类</span>
          <div className="category-rule-chips">
            {REMARK_SUGGESTIONS.slice(0, 10).map((item) => <button key={item} type="button" className={ruleCategory === item ? "active" : ""} onClick={() => setRuleCategory(item)}>{item}</button>)}
          </div>
          <input value={ruleCategory} onChange={(event) => setRuleCategory(event.target.value)} placeholder="也可以输入自定义分类" />
        </div>
        <div className="category-rule-preview">
          <span>{keyword.trim() ? `当前已加载流水中匹配 ${previewMatches} 笔` : "示例：输入“房东”后归入“房租水电”"}</span>
          <button type="button" disabled={!keyword.trim() || !ruleCategory.trim() || savingRule} onClick={() => void saveKeywordRule()}>{savingRule ? "应用中..." : "保存并应用"}</button>
        </div>
        <p className={`category-rule-message ${ruleMessage.startsWith("已应用") ? "success" : ""}`}>{ruleMessage}</p>
      </section>

     {rules.length ? <section className="category-rule-list">
        <div className="category-rule-list-heading"><strong>已保存规则</strong><small>{rules.length} 条</small></div>
        {rules.map((rule) => <div key={rule.id} className={`category-rule-row ${rule.isActive ? "" : "disabled"}`}>
          <span className="category-rule-keyword">{ruleKeyword(rule)}</span>
          <span className="category-rule-arrow">归入</span>
          <span className="category-rule-target">{rule.category}</span>
          <button type="button" className="category-rule-toggle" onClick={() => void toggleRule(rule)}>{rule.isActive ? "已启用" : "已停用"}</button>
          <button type="button" className="category-rule-delete" aria-label={`删除${ruleKeyword(rule)}规则`} onClick={() => void deleteRule(rule)}>删除</button>
        </div>)}
      </section> : null}

     <div className="bill-remark-filter">
        <button type="button" className={filter === "TRANSFER" ? "active" : ""} onClick={() => { setFilter("TRANSFER"); setExpandedId(null); }}>
          转账 <em>{transferCount}</em>
        </button>
        <button type="button" className={filter === "ALL" ? "active" : ""} onClick={() => { setFilter("ALL"); setExpandedId(null); }}>
          全部流水 <em>{allCount}</em>
        </button>
      </div>

      {loading ? (
        <div className="bill-remark-empty">加载中…</div>
      ) : billList.length ? (
        <div className="bill-remark-list">
          {billList.map((item) => {
            const remark = hasRemark(item);
            const expanded = expandedId === item.id;
            return (
              <div key={item.id} className={`bill-remark-row ${expanded ? "expanded" : ""}`}>
                <button type="button" className="bill-remark-row-main" onClick={() => toggleRow(item.id)}>
                  <span className="recent-icon"><img src={categoryIconSrc(item)} alt="" /></span>
                  <span className="bill-remark-info">
                    <strong>{item.category}</strong>
                    <small>{item.merchant || item.description || item.platform} · {timeLabel(item.date)}</small>
                  </span>
                  <span className={`bill-remark-amount ${item.type === "INCOME" ? "income" : item.type === "EXPENSE" ? "expense" : "transfer"}`}>{amountText(item)}</span>
                  <span className={`bill-remark-chip ${remark ? "set" : ""}`}>{remark ? item.remarkCategory : "未归类"}</span>
                </button>
                {expanded ? (
                  <RemarkCategoryEditor
                    initial={item.remarkCategory || ""}
                    suggestions={suggestions}
                    onSave={(value) => void saveRemark(item, value)}
                    onCancel={() => toggleRow(item.id)}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bill-remark-empty">当前没有可归类的转账账单</div>
      )}
    </div>
  );
}
