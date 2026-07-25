package com.wotty.stark

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.wotty.stark.data.repository.DataModeManager
import com.wotty.stark.ui.App

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val dataModeManager = DataModeManager(applicationContext)
        setContent { App(dataModeManager) }
    }
}
