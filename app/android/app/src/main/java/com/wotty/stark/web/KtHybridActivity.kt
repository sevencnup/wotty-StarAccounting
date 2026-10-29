package com.wotty.stark.web

import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.PorterDuff
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import org.json.JSONObject

private data class HybridTab(
    val path: String,
    val iconAsset: String,
    val description: String,
)

class KtHybridActivity : MainActivity() {
    private val tabs = listOf(
        HybridTab("/app", "home.png", "首页"),
        HybridTab("/app/consumption", "Consumption.png", "消费"),
        HybridTab("/app/savings", "Savings.png", "储蓄"),
        HybridTab("/app/loans", "loan.png", "贷款"),
        HybridTab("/app/assets", "assets.png", "资产"),
        HybridTab("/app/accounts", "setup.png", "设置"),
    )
    private val mainHandler = Handler(Looper.getMainLooper())
    private var webView: WebView? = null
    private var bottomBar: FrameLayout? = null
    private var tabIcons: List<ImageView> = emptyList()
    private var pendingPath: String? = null
    private var fallbackNavigation: Runnable? = null
    private val routeTracker = object : Runnable {
        override fun run() {
            synchronizeRoute()
            mainHandler.postDelayed(this, ROUTE_TRACK_INTERVAL_MS)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val activeWebView = bridge?.webView ?: return
        webView = activeWebView
        val currentUserAgent = activeWebView.settings.userAgentString.orEmpty()
        if (!currentUserAgent.contains("WottyStarkKtHybrid")) {
            activeWebView.settings.userAgentString = "$currentUserAgent WottyStarkKtHybrid"
        }
        installBottomBar()
    }

    override fun onDestroy() {
        mainHandler.removeCallbacks(routeTracker)
        fallbackNavigation?.let(mainHandler::removeCallbacks)
        webView = null
        super.onDestroy()
    }

    override fun onResume() {
        super.onResume()
        mainHandler.removeCallbacks(routeTracker)
        mainHandler.post(routeTracker)
    }

    override fun onPause() {
        mainHandler.removeCallbacks(routeTracker)
        super.onPause()
    }

    private fun installBottomBar() {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(Color.WHITE)
        }
        tabIcons = tabs.mapIndexed { index, tab ->
            val image = ImageView(this).apply {
                scaleType = ImageView.ScaleType.FIT_CENTER
                contentDescription = tab.description
                setImageBitmap(loadNavigationIcon(tab.iconAsset))
                setColorFilter(inactiveColor, PorterDuff.Mode.SRC_IN)
            }
            val item = FrameLayout(this).apply {
                isClickable = true
                isFocusable = true
                contentDescription = tab.description
                val selectableBackground = android.util.TypedValue()
                if (theme.resolveAttribute(android.R.attr.selectableItemBackground, selectableBackground, true)) {
                    setBackgroundResource(selectableBackground.resourceId)
                }
                addView(image, FrameLayout.LayoutParams(dp(28), dp(28), Gravity.CENTER))
                setOnClickListener { navigateToTab(index, tab) }
            }
            row.addView(item, LinearLayout.LayoutParams(0, dp(56), 1f))
            image
        }

        val bar = FrameLayout(this).apply {
            setBackgroundColor(Color.WHITE)
            elevation = dp(8).toFloat()
            visibility = View.GONE
            addView(
                row,
                FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(56), Gravity.TOP),
            )
        }
        bottomBar = bar
        val content = findViewById<ViewGroup>(android.R.id.content)
        content.addView(
            bar,
            FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(56), Gravity.BOTTOM),
        )
        ViewCompat.setOnApplyWindowInsetsListener(bar) { view, insets ->
            val bottomInset = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom
            val params = view.layoutParams
            params.height = dp(56) + bottomInset
            view.layoutParams = params
            insets
        }
        ViewCompat.requestApplyInsets(bar)
    }

    private fun loadNavigationIcon(name: String) = try {
        assets.open("public/nav-icons/$name").use { BitmapFactory.decodeStream(it) }
    } catch (_: Exception) {
        null
    }

    private fun navigateToTab(index: Int, tab: HybridTab) {
        val activeWebView = webView ?: return
        pendingPath = tab.path
        setSelectedTab(index)

        val targetJson = JSONObject.quote(tab.path)
        activeWebView.evaluateJavascript(
            "window.dispatchEvent(new CustomEvent('stark:kt-hybrid-tab',{detail:{path:$targetJson}}));",
            null,
        )

        fallbackNavigation?.let(mainHandler::removeCallbacks)
        val fallback = Runnable {
            if (pendingPath == tab.path && currentWebPath(activeWebView) != tab.path) {
                loadTabDirectly(activeWebView, tab.path)
            }
        }
        fallbackNavigation = fallback
        mainHandler.postDelayed(fallback, ROUTE_FALLBACK_DELAY_MS)
    }

    private fun loadTabDirectly(activeWebView: WebView, path: String) {
        val currentUri = runCatching { Uri.parse(activeWebView.url.orEmpty()) }.getOrNull() ?: return
        val host = currentUri.host
        if (currentUri.scheme != "http" || (host != "localhost" && host != "127.0.0.1")) return
        val targetUri = currentUri.buildUpon().path(path).clearQuery().fragment(null).build()
        activeWebView.loadUrl(targetUri.toString())
    }

    private fun currentWebPath(activeWebView: WebView): String? =
        runCatching { Uri.parse(activeWebView.url.orEmpty()).path?.trimEnd('/') }.getOrNull()

    private fun synchronizeRoute() {
        val activeWebView = webView ?: return
        val uri = runCatching { Uri.parse(activeWebView.url.orEmpty()) }.getOrNull()
        val isLocalPage = uri?.scheme == "http" && (uri.host == "localhost" || uri.host == "127.0.0.1")
        val path = if (isLocalPage) uri?.path?.trimEnd('/') else null
        val index = path?.let(::tabIndexForPath) ?: -1
        if (index >= 0) {
            setSelectedTab(index)
            activeWebView.evaluateJavascript("document.querySelector('.journal-overlay, .bottom-sheet-overlay') !== null") { result ->
                if (webView == activeWebView) {
                    bottomBar?.visibility = if (result == "true") View.GONE else View.VISIBLE
                }
            }
        } else {
            bottomBar?.visibility = View.GONE
        }
        if (path == pendingPath?.trimEnd('/')) {
            pendingPath = null
            fallbackNavigation?.let(mainHandler::removeCallbacks)
            fallbackNavigation = null
        }
    }

    private fun tabIndexForPath(path: String): Int = when (path.trimEnd('/').ifEmpty { "/" }) {
        "/app" -> 0
        "/app/consumption" -> 1
        "/app/savings" -> 2
        "/app/loans" -> 3
        "/app/assets" -> 4
        "/app/accounts" -> 5
        else -> if (path.startsWith("/app/budgets")) 0 else -1
    }

    private fun setSelectedTab(index: Int) {
        tabIcons.forEachIndexed { tabIndex, icon ->
            icon.setColorFilter(
                if (tabIndex == index) activeColor else inactiveColor,
                PorterDuff.Mode.SRC_IN,
            )
        }
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

    private val activeColor = Color.rgb(0, 96, 192)
    private val inactiveColor = Color.rgb(154, 165, 181)

    private companion object {
        const val ROUTE_FALLBACK_DELAY_MS = 1_500L
        const val ROUTE_TRACK_INTERVAL_MS = 250L
    }
}
