package com.wotty.stark.ui.components

import android.graphics.Color
import android.util.Base64
import android.view.View
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
                isVerticalScrollBarEnabled = false
                isHorizontalScrollBarEnabled = false
                isFocusable = false
                isFocusableInTouchMode = false
                isClickable = false
                isLongClickable = false
                setLayerType(View.LAYER_TYPE_HARDWARE, null)
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
            if (webView.tag == b64) return@AndroidView
            webView.tag = b64
            webView.evaluateJavascript("if(window.setOptionB64){window.setOptionB64('$b64')}", null)
        },
        modifier = modifier
    )
}