"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Subscription } from "@/lib/stark/models";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { getCurrentAccountId } from "@/lib/stark/storage/local-config";
import { ChoicePicker } from "@/components/stark/ChoicePicker";
import { createId } from "@/lib/stark/utils/id";
import { formatMoney, nowText } from "@/lib/stark/utils/format";
import { expenseCategoryOptions } from "@/lib/stark/utils/category-icon";
import { syncDueSubscriptionTransactions } from "@/lib/stark/subscriptions/recurring";

const manager = new DataModeManager();
const platforms = ["支付宝", "微信", "银行卡", "现金", "其他"];
const categoryPickerOptions = expenseCategoryOptions.map((category) => ({ value: category, label: category }));
const platformPickerOptions = platforms.map((platform) => ({ value: platform, label: platform }));

type FormState = {
  name: string;
  amount: string;
  billingDay: string;
  category: string;
  platform: string;
  paymentMethod: string;
  startDate: string;
};

function localDateText() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function emptyForm(): FormState {
  return {
    name: "",
    amount: "",
    billingDay: "1",
    category: "其他",
    platform: "其他",
    paymentMethod: "",
    startDate: localDateText(),
  };
}

function formFromSubscription(subscription: Subscription): FormState {
  return {
    name: subscription.name,
    amount: String(subscription.amount),
    billingDay: String(subscription.billingDay),
    category: subscription.category,
    platform: subscription.platform,
    paymentMethod: subscription.paymentMethod ?? "",
    startDate: subscription.startDate,
  };
}

export function SubscriptionManagementSheet() {
  const accountId = getCurrentAccountId();
  const [items, setItems] = useState<Subscription[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await manager.getRepository().getSubscriptions(accountId));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "周期支出读取失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => { void load(); }, [load]);

  const editing = useMemo(() => items.find((item) => item.id === editingId) ?? null, [editingId, items]);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
    setError("");
  }

  function beginCreate() {
    setEditingId("");
    setForm(emptyForm());
    setMessage("");
    setError("");
  }

  function beginEdit(subscription: Subscription) {
    setEditingId(subscription.id);
    setForm(formFromSubscription(subscription));
    setMessage("");
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
    setMessage("");
    setError("");
  }

  async function save() {
    const name = form.name.trim();
    const amount = Number(form.amount);
    const billingDay = Number(form.billingDay);
    if (!name) { setError("请输入项目名称"); return; }
    if (!Number.isFinite(amount) || amount <= 0) { setError("请输入大于 0 的每月金额"); return; }
    if (!Number.isInteger(billingDay) || billingDay < 1 || billingDay > 31) { setError("记账日请输入 1 到 31"); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.startDate)) { setError("请选择开始日期"); return; }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const repository = manager.getRepository();
      const user = await repository.getCurrentUser();
      if (!user) throw new Error("当前用户信息不可用，请重新进入应用");
      const timestamp = nowText();
      const next: Subscription = editing ? {
        ...editing,
        name,
        amount: Math.round(amount * 100) / 100,
        billingDay,
        category: form.category || "其他",
        platform: form.platform || "其他",
        paymentMethod: form.paymentMethod.trim() || null,
        startDate: form.startDate,
        updatedAt: timestamp,
      } : {
        id: createId("subscription"),
        userId: user.id,
        accountId,
        name,
        amount: Math.round(amount * 100) / 100,
        billingDay,
        category: form.category || "其他",
        platform: form.platform || "其他",
        paymentMethod: form.paymentMethod.trim() || null,
        startDate: form.startDate,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await repository.saveSubscription(next);
      const nextItems = editing ? items.map((item) => item.id === next.id ? next : item) : [...items, next];
      setItems(nextItems);
      const created = await syncDueSubscriptionTransactions(repository, accountId, user, nextItems);
      if (created > 0) window.dispatchEvent(new Event("stark:transaction-saved"));
      setEditingId(null);
      setForm(emptyForm());
      setMessage(editing ? "周期支出已更新" : created > 0 ? `周期支出已保存，已自动记入 ${created} 笔流水` : "周期支出已保存");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "周期支出保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(subscription: Subscription) {
    try {
      const repository = manager.getRepository();
      const updated = { ...subscription, isActive: !subscription.isActive, updatedAt: nowText() };
      await repository.saveSubscription(updated);
      const nextItems = items.map((item) => item.id === updated.id ? updated : item);
      setItems(nextItems);
      if (updated.isActive) {
        const user = await repository.getCurrentUser();
        if (user) {
          const created = await syncDueSubscriptionTransactions(repository, accountId, user, nextItems);
          if (created > 0) window.dispatchEvent(new Event("stark:transaction-saved"));
          setMessage(created > 0 ? `周期支出已启用，已自动记入 ${created} 笔流水` : "周期支出已启用");
        } else {
          setMessage("周期支出已启用");
        }
      } else {
        setMessage("周期支出已停用，历史流水不会删除");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "周期支出状态更新失败");
    }
  }

  async function remove(subscription: Subscription) {
    if (!window.confirm(`确定删除“${subscription.name}”吗？已生成的历史流水不会删除。`)) return;
    try {
      await manager.getRepository().deleteSubscription(subscription.id);
      setItems((current) => current.filter((item) => item.id !== subscription.id));
      if (editingId === subscription.id) cancelEdit();
      setMessage("周期支出已删除，历史流水已保留");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "周期支出删除失败");
    }
  }

  return (
    <div className="settings-sheet-body subscription-management-sheet">
      <p className="settings-sheet-note">按月自动记账。应用启动或从后台恢复时，会补记已经到期的月份；31 日在短月份按当月最后一天入账。</p>
      {loading ? <div className="subscription-empty">正在读取周期支出…</div> : null}
      {!loading && !items.length && editingId === null ? <div className="subscription-empty">还没有周期支出，添加保险费、房租等固定项目后，系统会按月自动记账。</div> : null}
      {!loading && items.length ? <div className="subscription-list">
        {items.map((subscription) => (
          <div key={subscription.id} className={`subscription-row${subscription.isActive ? "" : " disabled"}`}>
            <div className="subscription-row-main">
              <div className="subscription-row-title"><strong>{subscription.name}</strong><span>{subscription.isActive ? "自动记账中" : "已停用"}</span></div>
              <small>每月 {subscription.billingDay} 日 · {subscription.category} · {subscription.platform}</small>
            </div>
            <strong className="subscription-row-amount">¥ {formatMoney(subscription.amount)}</strong>
            <div className="subscription-row-actions">
              <button type="button" onClick={() => beginEdit(subscription)}>编辑</button>
              <button type="button" onClick={() => void toggle(subscription)}>{subscription.isActive ? "停用" : "启用"}</button>
              <button type="button" className="danger" onClick={() => void remove(subscription)}>删除</button>
            </div>
          </div>
        ))}
      </div> : null}
      {editingId === null ? <button type="button" className="settings-sheet-primary" onClick={beginCreate}>新增周期支出</button> : null}
      {editingId !== null ? <section className="subscription-editor">
        <div className="subscription-editor-heading"><strong>{editing ? "编辑周期支出" : "新增周期支出"}</strong><button type="button" onClick={cancelEdit}>取消</button></div>
        <label className="settings-url-field"><span>项目名称</span><input value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="例如：保险费、房租、视频会员" /></label>
        <div className="subscription-field-grid">
          <label className="settings-url-field"><span>每月金额（元）</span><input type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => updateForm("amount", event.target.value)} placeholder="0.00" /></label>
          <label className="settings-url-field"><span>记账日</span><input type="number" min="1" max="31" step="1" value={form.billingDay} onChange={(event) => updateForm("billingDay", event.target.value)} /></label>
        </div>
        <div className="subscription-field-grid">
          <div className="settings-url-field subscription-choice-field">
            <span>消费分类</span>
            <ChoicePicker ariaLabel="消费分类" title="选择消费分类" value={form.category} options={categoryPickerOptions} onChange={(value) => updateForm("category", value)} className="subscription-choice-picker" />
          </div>
          <div className="settings-url-field subscription-choice-field">
            <span>支付平台</span>
            <ChoicePicker ariaLabel="支付平台" title="选择支付平台" value={form.platform} options={platformPickerOptions} onChange={(value) => updateForm("platform", value)} className="subscription-choice-picker" />
          </div>
        </div>
        <label className="settings-url-field"><span>支付方式（可选）</span><input value={form.paymentMethod} onChange={(event) => updateForm("paymentMethod", event.target.value)} placeholder="例如：招商银行储蓄卡" /></label>
        <label className="settings-url-field"><span>开始记账日期</span><input type="date" value={form.startDate} onChange={(event) => updateForm("startDate", event.target.value)} /></label>
        {error ? <div className="cloud-test-status error">{error}</div> : null}
        {message ? <div className="cloud-test-status success">{message}</div> : null}
        <button type="button" className="settings-confirm-button" disabled={saving} onClick={() => void save()}>{saving ? "保存中…" : "保存周期支出"}</button>
      </section> : null}
      {editingId === null && error ? <div className="cloud-test-status error">{error}</div> : null}
      {editingId === null && message ? <div className="cloud-test-status success">{message}</div> : null}
    </div>
  );
}
