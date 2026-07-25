package com.wotty.stark.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ExchangeRate(
    val id: String = "",
    val from: String,
    val to: String,
    val rate: Double,
    val updatedAt: String = ""
)

@Serializable
data class CategoryRule(
    val id: String = "",
    val userId: String,
    val accountId: String,
    val name: String? = null,
    val merchant: String,
    val merchantKey: String,
    val category: String,
    val description: String? = null,
    val isActive: Boolean = true,
    val createdAt: String = "",
    val updatedAt: String = ""
)

@Serializable
data class ImportErrorLog(
    val id: String = "",
    val userId: String,
    val accountId: String,
    val fileName: String,
    val lineNumber: Int,
    val rawData: String,
    val errorMessage: String,
    val errorType: String,
    val resolved: Boolean = false,
    val createdAt: String = ""
)

@Serializable
data class ThemeConfig(
    val id: String = "",
    val userId: String,
    val accountId: String? = null,
    val themeId: String = "default",
    val primaryColor: String? = null,
    val radius: Float? = null,
    val isDarkMode: Boolean = false,
    val chartStyle: String? = null,
    val createdAt: String = "",
    val updatedAt: String = ""
)
