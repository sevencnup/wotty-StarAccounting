package com.wotty.stark.data.repository

import android.content.Context
import com.wotty.stark.data.model.DataMode
import com.wotty.stark.data.local.LocalRepository
import com.wotty.stark.data.remote.CloudRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class DataModeManager(context: Context) {

    private val localRepo = LocalRepository(context)
    private val cloudRepo = CloudRepository()

    private val _currentMode = MutableStateFlow(DataMode.LOCAL)
    val currentMode: StateFlow<DataMode> = _currentMode.asStateFlow()

    fun getRepository(): DataRepository = when (_currentMode.value) {
        DataMode.LOCAL -> localRepo
        DataMode.CLOUD -> cloudRepo
    }

    fun getLocalRepository(): DataRepository = localRepo

    suspend fun switchMode(newMode: DataMode) {
        _currentMode.value = newMode
    }
}
