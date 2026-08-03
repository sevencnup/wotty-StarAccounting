package com.wotty.stark.data.repository

import android.content.Context
import com.wotty.stark.data.model.DataMode
import com.wotty.stark.data.local.LocalRepository
import com.wotty.stark.data.remote.CloudRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class DataModeManager(context: Context) {

    private val preferences = context.getSharedPreferences("stark-data-mode", Context.MODE_PRIVATE)
    private val localRepo = LocalRepository(context)
    private var cloudRepo = CloudRepository(
        baseUrl = preferences.getString(KEY_CLOUD_BASE_URL, DEFAULT_CLOUD_BASE_URL) ?: DEFAULT_CLOUD_BASE_URL
    )

    private val _currentMode = MutableStateFlow(
        preferences.getString(KEY_MODE, DataMode.LOCAL.name)
            ?.let { runCatching { DataMode.valueOf(it) }.getOrDefault(DataMode.LOCAL) }
            ?: DataMode.LOCAL
    )
    val currentMode: StateFlow<DataMode> = _currentMode.asStateFlow()

    private val _cloudBaseUrl = MutableStateFlow(
        preferences.getString(KEY_CLOUD_BASE_URL, DEFAULT_CLOUD_BASE_URL) ?: DEFAULT_CLOUD_BASE_URL
    )
    val cloudBaseUrl: StateFlow<String> = _cloudBaseUrl.asStateFlow()

    fun getRepository(): DataRepository = when (_currentMode.value) {
        DataMode.LOCAL -> localRepo
        DataMode.CLOUD -> cloudRepo
    }

    fun getLocalRepository(): DataRepository = localRepo

    fun setCloudBaseUrl(rawUrl: String) {
        val normalizedUrl = normalizeBaseUrl(rawUrl)
        _cloudBaseUrl.value = normalizedUrl
        cloudRepo = CloudRepository(normalizedUrl)
        preferences.edit().putString(KEY_CLOUD_BASE_URL, normalizedUrl).apply()
    }

    suspend fun testCloudConnection(rawUrl: String = _cloudBaseUrl.value): Boolean {
        return CloudRepository(normalizeBaseUrl(rawUrl)).checkHealth()
    }

    suspend fun switchMode(newMode: DataMode) {
        _currentMode.value = newMode
        preferences.edit().putString(KEY_MODE, newMode.name).apply()
    }

    private fun normalizeBaseUrl(rawUrl: String): String {
        var url = rawUrl.trim().removeSuffix("/")
        if (!url.endsWith("/api")) url += "/api"
        return url
    }

    private companion object {
        const val KEY_MODE = "mode"
        const val KEY_CLOUD_BASE_URL = "cloud-base-url"
        const val DEFAULT_CLOUD_BASE_URL = "http://10.0.2.2:8080/api"
    }
}
