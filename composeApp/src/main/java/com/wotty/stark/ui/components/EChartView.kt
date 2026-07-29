package com.wotty.stark.ui.components

import android.graphics.Color
import android.util.Base64
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

@Composable
fun EChartView(optionJson: String, modifier: Modifier = Modifier) {
    AndroidView(
        factory = { ctx ->
            WebView(ctx).apply {
                settings.javaScriptEnabled = true
                settings.allowFileAccess = true
                settings.allowFileAccessFromFileURLs = true
                settings.domStorageEnabled = true
                setBackgroundColor(Color.TRANSPARENT)
                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView, url: String?) {
                        val b64 = view.tag as? String ?: return
                        view.evaluateJavascript("window.setOptionB64('$b64')", null)
                    }
                }
                loadUrl("file:///android_asset/echarts.html")
            }
        },
        update = { webView ->
            val b64 = Base64.encodeToString(optionJson.toByteArray(Charsets.UTF_8), Base64.NO_WRAP)
            webView.tag = b64
            webView.evaluateJavascript("if(window.setOptionB64){window.setOptionB64('$b64')}", null)
        },
        modifier = modifier
    )
}