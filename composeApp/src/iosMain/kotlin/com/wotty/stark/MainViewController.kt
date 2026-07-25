package com.wotty.stark

import androidx.compose.ui.window.ComposeUIViewController
import com.wotty.stark.data.local.PlatformFileHelper
import com.wotty.stark.data.repository.DataModeManager
import com.wotty.stark.ui.App

fun MainViewController() = ComposeUIViewController {
    val fileHelper = PlatformFileHelper()
    val dataModeManager = DataModeManager(fileHelper)
    App(dataModeManager)
}
