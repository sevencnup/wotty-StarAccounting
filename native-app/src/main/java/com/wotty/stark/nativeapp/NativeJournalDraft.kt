package com.wotty.stark.nativeapp

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

internal data class NativeJournalDraft(
    val entryMode: String = "NORMAL",
    val salaryEntryMode: String = "SINGLE",
    val type: EntryType = EntryType.EXPENSE,
    val ordinaryType: EntryType = EntryType.EXPENSE,
    val ordinaryCategory: String = "餐饮",
    val merchant: String = "",
    val description: String = "",
    val amount: String = "",
    val category: String = "餐饮",
    val platform: String = "支付宝",
    val date: String = "",
    val time: String = "12:00",
    val salaryYear: String = "",
    val salaryMonths: Set<Int> = emptySet(),
    val salaryPayday: String = "15",
)

internal class NativeJournalDraftStore(context: Context) {
    private val preferences = context.getSharedPreferences("native-entry-drafts", Context.MODE_PRIVATE)

    fun load(scope: String, accountId: String): NativeJournalDraft? {
        val raw = preferences.getString(key(scope, accountId), null) ?: return null
        return runCatching { decode(JSONObject(raw)) }.getOrNull()
    }

    fun save(scope: String, accountId: String, draft: NativeJournalDraft) {
        val months = JSONArray().apply { draft.salaryMonths.sorted().forEach { put(it) } }
        val payload = JSONObject()
            .put("entryMode", draft.entryMode)
            .put("salaryEntryMode", draft.salaryEntryMode)
            .put("type", draft.type.name)
            .put("ordinaryType", draft.ordinaryType.name)
            .put("ordinaryCategory", draft.ordinaryCategory)
            .put("merchant", draft.merchant)
            .put("description", draft.description)
            .put("amount", draft.amount)
            .put("category", draft.category)
            .put("platform", draft.platform)
            .put("date", draft.date)
            .put("time", draft.time)
            .put("salaryYear", draft.salaryYear)
            .put("salaryMonths", months)
            .put("salaryPayday", draft.salaryPayday)
        preferences.edit().putString(key(scope, accountId), payload.toString()).apply()
    }

    fun clear(scope: String, accountId: String) {
        preferences.edit().remove(key(scope, accountId)).apply()
    }

    private fun decode(raw: JSONObject): NativeJournalDraft {
        fun entryType(name: String, fallback: EntryType) =
            EntryType.entries.firstOrNull { it.name == name && it != EntryType.REPAYMENT } ?: fallback

        val monthArray = raw.optJSONArray("salaryMonths")
        val months = if (monthArray == null) emptySet() else (0 until monthArray.length())
            .mapNotNull { monthArray.optInt(it).takeIf { month -> month in 1..12 } }
            .toSet()
        val entryMode = raw.optString("entryMode", "NORMAL").takeIf { it == "SALARY" } ?: "NORMAL"
        val salaryEntryMode = raw.optString("salaryEntryMode", "SINGLE").takeIf { it == "BATCH" } ?: "SINGLE"
        return NativeJournalDraft(
            entryMode = entryMode,
            salaryEntryMode = salaryEntryMode,
            type = entryType(raw.optString("type"), EntryType.EXPENSE),
            ordinaryType = entryType(raw.optString("ordinaryType"), EntryType.EXPENSE),
            ordinaryCategory = raw.optString("ordinaryCategory", "餐饮"),
            merchant = raw.optString("merchant"),
            description = raw.optString("description"),
            amount = raw.optString("amount"),
            category = raw.optString("category", "餐饮"),
            platform = raw.optString("platform", "支付宝"),
            date = raw.optString("date"),
            time = raw.optString("time", "12:00"),
            salaryYear = raw.optString("salaryYear"),
            salaryMonths = months,
            salaryPayday = raw.optString("salaryPayday", "15"),
        )
    }

    private fun key(scope: String, accountId: String) = "journal_${scope}_$accountId"
}
