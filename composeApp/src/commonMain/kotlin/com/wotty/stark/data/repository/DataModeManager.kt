package com.wotty.stark.data.repository

import com.wotty.stark.data.local.LocalFileRepository
import com.wotty.stark.data.local.PlatformFileHelper
import com.wotty.stark.data.model.DataMode
import com.wotty.stark.data.remote.CloudApiRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * 数据模式管理器
 *
 * 持有当前模式标识，对外提供统一的 DataRepository 接口。
 * 所有 ViewModel 只依赖 DataRepository，不关心底层实现。
 * 切换模式时，同步切换实际的 repository 实现并触发数据迁移回调。
 */
class DataModeManager(
    private val fileHelper: PlatformFileHelper
) {
    private val localRepo = LocalFileRepository(fileHelper)
    private val cloudRepo = CloudApiRepository()

    private val _currentMode = MutableStateFlow(DataMode.LOCAL)
    val currentMode: StateFlow<DataMode> = _currentMode.asStateFlow()

    /**
     * 获取当前模式的 Repository
     */
    fun getRepository(): DataRepository = when (_currentMode.value) {
        DataMode.LOCAL -> localRepo
        DataMode.CLOUD -> cloudRepo
    }

    /**
     * 获取本地 Repository（用于迁移数据）
     */
    fun getLocalRepository(): DataRepository = localRepo

    /**
     * 切换数据模式
     */
    suspend fun switchMode(newMode: DataMode): Boolean {
        if (newMode == _currentMode.value) return true

        _currentMode.value = newMode
        // TODO: 数据迁移逻辑将在后续阶段实现
        // 本地→云端：逐条推送到后端 API
        // 云端→本地：从 API 拉取写入 JSON
        return true
    }
}
