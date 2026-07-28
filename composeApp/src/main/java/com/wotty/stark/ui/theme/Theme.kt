package com.wotty.stark.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = Color(0xFF2678FF),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFE7F0FF),
    onPrimaryContainer = Color(0xFF1556C8),
    secondary = Color(0xFF43A047),
    onSecondary = Color.White,
    background = Color(0xFFF4F7FB),
    surface = Color.White,
    surfaceVariant = Color.White,
    onSurface = Color(0xFF1A1A1A),
    onSurfaceVariant = Color(0xFF666666),
    error = Color(0xFFE53935),
    outline = Color(0xFFE0E0E0)
)

@Composable
fun StarTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColors,
        content = content
    )
}
