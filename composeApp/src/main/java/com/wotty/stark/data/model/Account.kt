package com.wotty.stark.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Account(
    val id: String = "",
    val name: String,
    val ownerId: String,
    val createdAt: String = "",
    val updatedAt: String = ""
)

@Serializable
data class AccountMember(
    val id: String = "",
    val accountId: String,
    val userId: String,
    val role: AccountRole = AccountRole.MEMBER,
    val nickname: String? = null,
    val canViewOwn: Boolean = true,
    val canManageOwn: Boolean = true,
    val canViewAll: Boolean = false,
    val canManageAll: Boolean = false,
    val joinedAt: String = ""
)

@Serializable
enum class AccountRole { OWNER, ADMIN, MEMBER }
