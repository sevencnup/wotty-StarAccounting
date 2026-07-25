package com.wotty.stark.data.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String = "",
    val email: String,
    val password: String,
    val name: String? = null,
    val defaultAccountId: String? = null,
    val role: UserRole = UserRole.USER,
    val createdAt: String = "",
    val updatedAt: String = ""
)

@Serializable
enum class UserRole { USER, ADMIN }
