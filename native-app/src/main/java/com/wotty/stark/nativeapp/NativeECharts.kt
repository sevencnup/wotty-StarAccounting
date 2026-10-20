package com.wotty.stark.nativeapp

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color as AndroidColor
import android.graphics.Paint
import android.graphics.RectF
import android.util.Base64
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceResponse
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.viewinterop.AndroidView
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayInputStream
import kotlin.math.ceil
import kotlin.math.roundToInt

internal data class NativeEChartClick(
    val componentType: String,
    val dataType: String,
    val name: String,
    val seriesName: String,
    val dataIndex: Int,
)

internal data class NativeEChartSeries(
    val name: String,
    val color: String,
    val values: List<Double>,
)

internal data class NativeEChartSlice(
    val name: String,
    val value: Double,
    val color: String,
)

internal fun Color.toEChartHex(): String = "#%06X".format(java.util.Locale.ROOT, toArgb() and 0x00FFFFFF)

/** Compose host for the same ECharts runtime used by the web client. */
@Composable
internal fun NativeEChart(
    option: JSONObject,
    modifier: Modifier = Modifier,
    onDataClick: ((NativeEChartClick) -> Unit)? = null,
) {
    val optionJson by rememberUpdatedState(option.toString())
    val clickHandler by rememberUpdatedState(onDataClick)
    val context = LocalContext.current
    val density = LocalDensity.current.density
    val chartView = remember(context) {
        NativeEChartWebView(
            context = context,
            onDataClick = { clickHandler?.invoke(it) },
        )
    }

    AndroidView(
        factory = { chartView },
        modifier = modifier.pointerInput(chartView, density) {
            detectTapGestures { offset ->
                chartView.dispatchNativeTap(offset.x / density, offset.y / density)
            }
        },
        update = { it.setOption(optionJson) },
        onRelease = { it.releaseChart() },
    )
}

private class NativeEChartWebView(
    context: Context,
    private val onDataClick: (NativeEChartClick) -> Unit,
) : WebView(context) {
    private var pageReady = false
    private var pendingOption: String? = null
    private var renderedChart: Bitmap? = null
    private val renderedChartPaint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)

    init {
        setBackgroundColor(AndroidColor.TRANSPARENT)
        // Compose owns gestures so chart taps can be dispatched without the WebView
        // swallowing vertical LazyColumn or horizontal chart-scroll gestures.
        isClickable = false
        isFocusable = false
        isFocusableInTouchMode = false
        isVerticalScrollBarEnabled = false
        isHorizontalScrollBarEnabled = false
        overScrollMode = View.OVER_SCROLL_NEVER
        settings.apply {
            javaScriptEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            domStorageEnabled = false
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            textZoom = 100
        }
        addJavascriptInterface(
            NativeEChartBridge(
                dispatchClick = { event ->
                    post { onDataClick(event) }
                },
                dispatchImage = ::showRenderedChart,
            ),
            "NativeChart",
        )
        webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(message: ConsoleMessage): Boolean {
                if (BuildConfig.DEBUG) Log.d("NativeECharts", "${message.message()} (${message.sourceId()}:${message.lineNumber()})")
                return true
            }
        }
        webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView, url: String?) {
                super.onPageFinished(view, url)
                pageReady = true
                logChart("page ready: $url")
                syncChartSize()
                renderPendingOption()
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val uri = request.url
                val blocked = !(request.isForMainFrame && uri.scheme == "data" && uri.toString().startsWith("data:text/html"))
                logChart("navigation ${if (blocked) "blocked" else "allowed"}: $uri")
                return blocked
            }

            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                val uri = request.url
                if (uri.scheme == "data") {
                    logChart("main document request: $uri")
                    return null
                }
                if (uri.host == "appassets.androidplatform.net" && uri.path == "/assets/echarts.min.js") {
                    logChart("serving ECharts asset: $uri")
                    return WebResourceResponse("application/javascript", "UTF-8", context.assets.open("echarts.min.js"))
                }
                logChart("blocked resource: $uri")
                return WebResourceResponse(
                    "text/plain",
                    "UTF-8",
                    403,
                    "Blocked",
                    emptyMap(),
                    ByteArrayInputStream(ByteArray(0)),
                )
            }
        }
        val html = context.assets.open("native-echarts.html").bufferedReader().use { it.readText() }
        loadDataWithBaseURL(
            "https://appassets.androidplatform.net/assets/",
            html,
            "text/html",
            "UTF-8",
            null,
        )
    }

    fun setOption(json: String) {
        if (pendingOption == json) return
        pendingOption = json
        renderPendingOption()
    }

    private fun renderPendingOption() {
        val json = pendingOption ?: return
        if (!pageReady) return
        evaluateJavascript("JSON.stringify(window.renderNativeChart(${JSONObject.quote(json)}))") { result -> logChart("chart state: $result") }
    }

    override fun onSizeChanged(width: Int, height: Int, oldWidth: Int, oldHeight: Int) {
        super.onSizeChanged(width, height, oldWidth, oldHeight)
        logChart("view measured: ${width}x${height}")
        syncChartSize()
    }

    private fun syncChartSize() {
        if (!pageReady || width <= 0 || height <= 0) return
        val density = resources.displayMetrics.density
        val cssWidth = (width / density).roundToInt().coerceAtLeast(1)
        val cssHeight = (height / density).roundToInt().coerceAtLeast(1)
        evaluateJavascript("window.setNativeChartSize($cssWidth,$cssHeight)", null)
    }

    private fun logChart(message: String) {
        if (BuildConfig.DEBUG) Log.d("NativeECharts", message)
    }

    fun dispatchNativeTap(cssX: Float, cssY: Float) {
        if (!pageReady) return
        logChart("compose tap: ${cssX.roundToInt()},${cssY.roundToInt()}")
        evaluateJavascript("window.dispatchNativeChartTap($cssX,$cssY)") { result -> logChart("tap hit: $result") }
    }

    private fun showRenderedChart(bitmap: Bitmap) {
        post {
            if (!pageReady || width <= 0 || height <= 0) {
                bitmap.recycle()
                return@post
            }
            renderedChart?.recycle()
            renderedChart = bitmap
            postInvalidateOnAnimation()
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        renderedChart?.let { bitmap ->
            canvas.drawBitmap(bitmap, null, RectF(0f, 0f, width.toFloat(), height.toFloat()), renderedChartPaint)
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean = false

    fun releaseChart() {
        pageReady = false
        pendingOption = null
        removeJavascriptInterface("NativeChart")
        stopLoading()
        renderedChart?.recycle()
        renderedChart = null
        destroy()
    }

}

internal class NativeEChartBridge(
    private val dispatchClick: (NativeEChartClick) -> Unit,
    private val dispatchImage: (Bitmap) -> Unit,
) {
    @JavascriptInterface
    fun onDataClick(payload: String) {
        val json = runCatching { JSONObject(payload) }.getOrNull() ?: return
        if (BuildConfig.DEBUG) Log.d("NativeECharts", "chart click: ${json.optString("name")} / ${json.optString("seriesName")}")
        dispatchClick(
            NativeEChartClick(
                componentType = json.optString("componentType"),
                dataType = json.optString("dataType"),
                name = json.optString("name"),
                seriesName = json.optString("seriesName"),
                dataIndex = json.optInt("dataIndex", -1),
            ),
        )
    }

    @JavascriptInterface
    fun onRenderImage(dataUrl: String) {
        val encoded = dataUrl.substringAfter("base64,", missingDelimiterValue = "")
        if (encoded.isBlank()) return
        val bitmap = runCatching {
            val bytes = Base64.decode(encoded, Base64.DEFAULT)
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
        }.getOrNull() ?: return
        dispatchImage(bitmap)
    }
}

internal object NativeEChartOptions {
    private val platformColors = mapOf(
        "微信" to "#1baf7a",
        "支付宝" to "#2a78d6",
        "银行卡" to "#008300",
        "现金" to "#eda100",
        "其他" to "#4a3aa7",
    )
    private val categoryColors = mapOf(
        "餐饮" to "#ff7a32", "购物" to "#ff4d6a", "交通" to "#57b3ff",
        "住房" to "#7c5cfc", "娱乐" to "#ff9f43", "医疗" to "#ff5c8a",
        "日用" to "#0d8a5f", "服装" to "#b37feb", "美容" to "#f759ab",
        "宠物" to "#ff7a45", "通讯" to "#597ef7", "运动" to "#36cfc9",
        "旅行" to "#9254de", "教育" to "#40a9ff", "其他" to "#bfbfbf",
    )
    private val palette = listOf("#2a78d6", "#1baf7a", "#eda100", "#eb6834", "#8b5cf6", "#f759ab", "#36cfc9", "#597ef7")

    fun cashflowTrend(incomes: List<Double>, expenses: List<Double>, labels: List<String>): JSONObject {
        val maximumValue = ceil(((incomes + expenses).maxOrNull() ?: 8_000.0).coerceAtLeast(8_000.0) / 2_000.0) * 2_000.0
        return JSONObject()
            .put("animationDuration", 450)
            .put("__nativeCompactAxis", "y")
            .put("grid", JSONObject().put("left", 24).put("right", 10).put("top", 14).put("bottom", 22))
            .put("tooltip", JSONObject().put("trigger", "axis").put("confine", true).put("backgroundColor", "rgba(19,27,48,.92)").put("borderWidth", 0).put("padding", JSONArray().put(8).put(10)).put("textStyle", JSONObject().put("color", "#fff").put("fontSize", 12)).put("valueFormatter", "¥ {value}"))
            .put("xAxis", JSONObject().put("type", "category").put("boundaryGap", false).put("data", strings(labels)).put("axisLine", JSONObject().put("lineStyle", JSONObject().put("color", "#e1e8f2"))).put("axisTick", JSONObject().put("show", false)).put("axisLabel", JSONObject().put("color", "#74819a").put("fontSize", 10).put("margin", 8)))
            .put("yAxis", JSONObject().put("type", "value").put("min", 0).put("max", maximumValue).put("splitNumber", 4).put("axisLine", JSONObject().put("show", false)).put("axisTick", JSONObject().put("show", false)).put("axisLabel", JSONObject().put("color", "#74819a").put("fontSize", 10)).put("splitLine", JSONObject().put("lineStyle", JSONObject().put("color", "#eef2f7").put("type", "dashed"))))
            .put("series", JSONArray()
                .put(lineSeries("收入", incomes, "#2a78d6"))
                .put(lineSeries("支出", expenses, "#eb6834")))
    }

    fun categoryDonut(categories: List<Pair<String, Double>>): JSONObject {
        val slices = categories.mapIndexed { index, (name, amount) ->
            NativeEChartSlice(name, amount, categoryColors[name] ?: palette[index % palette.size])
        }
        return donut(slices)
    }

    fun donut(slices: List<NativeEChartSlice>): JSONObject {
        val data = JSONArray()
        slices.forEach { slice ->
            data.put(JSONObject().put("name", slice.name).put("value", slice.value).put("itemStyle", JSONObject().put("color", slice.color)))
        }
        return JSONObject()
            .put("animationDuration", 450)
            .put("__nativePieTooltip", true)
            .put("tooltip", JSONObject().put("trigger", "item").put("confine", true).put("backgroundColor", "rgba(19,27,48,.92)").put("borderWidth", 0).put("padding", JSONArray().put(8).put(10)).put("textStyle", JSONObject().put("color", "#fff").put("fontSize", 12)).put("formatter", "{b}<br/>¥ {c} ({d}%)"))
            .put("series", JSONArray().put(JSONObject()
                .put("type", "pie")
                .put("radius", JSONArray().put("56%").put("78%"))
                .put("center", JSONArray().put("50%").put("52%"))
                .put("avoidLabelOverlap", true)
                .put("label", JSONObject().put("show", false))
                .put("labelLine", JSONObject().put("show", false))
                .put("emphasis", JSONObject().put("scale", false))
                .put("itemStyle", JSONObject().put("borderColor", "#ffffff").put("borderWidth", 2))
                .put("data", data)))
    }

    fun loanForecast(values: List<Double>, labels: List<String>): JSONObject {
        val series = JSONObject()
            .put("name", "月供")
            .put("type", "line")
            .put("smooth", true)
            .put("symbol", "circle")
            .put("symbolSize", 6)
            .put("data", numbers(values))
            .put("itemStyle", JSONObject().put("color", "#0d8a5f").put("borderWidth", 2).put("borderColor", "#ffffff"))
            .put("lineStyle", JSONObject().put("width", 3).put("color", "#0d8a5f"))
            .put("areaStyle", JSONObject().put("color", JSONObject()
                .put("type", "linear").put("x", 0).put("y", 0).put("x2", 0).put("y2", 1)
                .put("colorStops", JSONArray()
                    .put(JSONObject().put("offset", 0).put("color", "rgba(13,138,95,.28)"))
                    .put(JSONObject().put("offset", 1).put("color", "rgba(13,138,95,0)")))))
        return JSONObject()
            .put("animationDuration", 450)
            .put("__nativeCompactAxis", "loan-y")
            .put("grid", JSONObject().put("left", 16).put("right", 14).put("top", 20).put("bottom", 24))
            .put("tooltip", JSONObject().put("trigger", "axis").put("confine", true).put("backgroundColor", "rgba(255,255,255,.96)").put("borderColor", "rgba(13,138,95,.2)").put("textStyle", JSONObject().put("color", "#142036").put("fontSize", 12)).put("valueFormatter", "¥ {value}"))
            .put("xAxis", JSONObject().put("type", "category").put("data", strings(labels)).put("axisLine", JSONObject().put("lineStyle", JSONObject().put("color", "#e2ecf2"))).put("axisTick", JSONObject().put("show", false)).put("axisLabel", JSONObject().put("color", "#64748b").put("fontSize", 11)))
            .put("yAxis", JSONObject().put("type", "value").put("splitLine", JSONObject().put("lineStyle", JSONObject().put("color", "rgba(226,236,242,.6)").put("type", "dashed"))).put("axisLabel", JSONObject().put("color", "#94a3b8").put("fontSize", 10)))
            .put("series", JSONArray().put(series))
    }

    fun merchantRanking(items: List<Pair<String, Double>>): JSONObject {
        val display = items.take(10).reversed()
        return JSONObject()
            .put("animationDuration", 450)
            .put("__nativeCompactAxis", "x")
            .put("grid", JSONObject().put("left", 82).put("right", 18).put("top", 8).put("bottom", 8))
            .put("tooltip", JSONObject().put("trigger", "axis").put("confine", true).put("backgroundColor", "rgba(19,27,48,.92)").put("borderWidth", 0).put("axisPointer", JSONObject().put("type", "shadow")).put("formatter", "{b}<br/>¥ {c}"))
            .put("xAxis", JSONObject().put("type", "value").put("min", 0).put("splitNumber", 4).put("axisLine", JSONObject().put("show", false)).put("axisTick", JSONObject().put("show", false)).put("axisLabel", JSONObject().put("color", "#74819a").put("fontSize", 9)).put("splitLine", JSONObject().put("lineStyle", JSONObject().put("color", "#eef2f7").put("type", "dashed"))))
            .put("yAxis", JSONObject().put("type", "category").put("data", strings(display.map { it.first })).put("axisLine", JSONObject().put("show", false)).put("axisTick", JSONObject().put("show", false)).put("axisLabel", JSONObject().put("color", "#405268").put("fontSize", 10).put("width", 70).put("overflow", "truncate")))
            .put("series", JSONArray().put(JSONObject().put("name", "商家消费").put("type", "bar").put("barWidth", 14).put("itemStyle", JSONObject().put("color", "#2a78d6").put("borderRadius", JSONArray().put(0).put(7).put(7).put(0))).put("data", numbers(display.map { it.second }))))
    }

    fun platformBars(labels: List<String>, series: List<NativeEChartSeries>): JSONObject {
        val maxBarWidth = if (labels.size > 18) 6 else 14
        val seriesOptions = JSONArray()
        series.forEach { item ->
            seriesOptions.put(JSONObject()
                .put("name", item.name)
                .put("type", "bar")
                .put("stack", "total")
                .put("barWidth", maxBarWidth)
                .put("itemStyle", JSONObject().put("color", item.color).put("borderRadius", JSONArray().put(3).put(3).put(0).put(0)))
                .put("data", numbers(item.values)))
        }
        return JSONObject()
            .put("animationDuration", 450)
            .put("__nativeCompactAxis", "y")
            .put("grid", JSONObject().put("left", 30).put("right", 10).put("top", 12).put("bottom", 22))
            .put("tooltip", JSONObject().put("trigger", "axis").put("confine", true).put("backgroundColor", "rgba(19,27,48,.92)").put("borderWidth", 0).put("axisPointer", JSONObject().put("type", "shadow")).put("formatter", "{b}<br/>¥ {c}"))
            .put("xAxis", JSONObject().put("type", "category").put("data", strings(labels)).put("axisLine", JSONObject().put("lineStyle", JSONObject().put("color", "#e1e8f2"))).put("axisTick", JSONObject().put("show", false)).put("axisLabel", JSONObject().put("color", "#74819a").put("fontSize", 9)))
            .put("yAxis", JSONObject().put("type", "value").put("axisLine", JSONObject().put("show", false)).put("axisTick", JSONObject().put("show", false)).put("axisLabel", JSONObject().put("color", "#74819a").put("fontSize", 9)).put("splitLine", JSONObject().put("lineStyle", JSONObject().put("color", "#eef2f7").put("type", "dashed"))))
            .put("series", seriesOptions)
    }

    fun sankey(edges: List<NativeConsumptionFlowEdge>): JSONObject {
        val positive = edges.filter { it.amount > 0.0 && it.amount.isFinite() }
        val categories = positive.groupBy(NativeConsumptionFlowEdge::category)
            .mapValues { (_, rows) -> rows.sumOf(NativeConsumptionFlowEdge::amount) }
            .entries.sortedByDescending(Map.Entry<String, Double>::value).map { it.key }
        val visibleEdges = positive.filter { it.category in categories }
        val commonPlatforms = listOf("微信", "支付宝", "银行卡", "现金", "其他")
            .filter { platform -> visibleEdges.any { it.platform == platform } }
        val extraPlatforms = visibleEdges.map(NativeConsumptionFlowEdge::platform).distinct().filterNot { it in commonPlatforms }
        val platforms = commonPlatforms + extraPlatforms
        val nodes = JSONArray()
        platforms.forEach { platform ->
            nodes.put(JSONObject()
                .put("name", "account::$platform")
                .put("itemStyle", JSONObject().put("color", platformColors[platform] ?: platformColors.getValue("其他")))
                .put("label", JSONObject().put("show", true).put("position", "right").put("offset", JSONArray().put(0).put(-4)).put("formatter", platform)))
        }
        categories.forEachIndexed { index, category ->
            nodes.put(JSONObject()
                .put("name", "category::$category")
                .put("itemStyle", JSONObject().put("color", categoryColors[category] ?: palette[index % palette.size]))
                .put("label", JSONObject().put("show", true).put("position", "right").put("formatter", category)))
        }
        val links = JSONArray()
        visibleEdges.forEach { edge ->
            links.put(JSONObject()
                .put("source", "account::${edge.platform}")
                .put("target", "category::${edge.category}")
                .put("value", edge.amount))
        }
        return JSONObject()
            .put("__nativeSankeyTooltip", true)
            .put("tooltip", JSONObject().put("confine", true).put("backgroundColor", "rgba(19,27,48,.92)").put("borderWidth", 0).put("padding", JSONArray().put(8).put(10)).put("textStyle", JSONObject().put("color", "#fff").put("fontSize", 12)).put("formatter", "{b}"))
            .put("series", JSONArray().put(JSONObject()
                .put("type", "sankey")
                .put("layout", "none")
                .put("layoutIterations", 32)
                .put("left", 22)
                .put("right", 112)
                .put("top", 8)
                .put("bottom", 8)
                .put("nodeWidth", 14)
                .put("nodeGap", 10)
                .put("labelLayout", JSONObject().put("hideOverlap", true))
                .put("lineStyle", JSONObject().put("color", "gradient").put("opacity", .35))
                .put("label", JSONObject().put("color", "#11182d").put("fontSize", 10).put("distance", 8).put("lineHeight", 14).put("overflow", "truncate").put("width", 58))
                .put("data", nodes)
                .put("links", links)))
    }

    fun colorForPlatform(platform: String): String = platformColors[platform] ?: platformColors.getValue("其他")

    fun colorForCategory(category: String, index: Int): String = categoryColors[category] ?: palette[index % palette.size]

    private fun lineSeries(name: String, values: List<Double>, color: String) = JSONObject()
        .put("name", name)
        .put("type", "line")
        .put("smooth", true)
        .put("symbol", "circle")
        .put("symbolSize", 6)
        .put("data", numbers(values))
        .put("lineStyle", JSONObject().put("width", 2).put("color", color))
        .put("itemStyle", JSONObject().put("color", color).put("borderColor", "#ffffff").put("borderWidth", 1.2))

    private fun strings(values: List<String>) = JSONArray().also { array -> values.forEach(array::put) }
    private fun numbers(values: List<Double>) = JSONArray().also { array -> values.forEach { value -> array.put(value.takeIf(Double::isFinite) ?: 0.0) } }
}
