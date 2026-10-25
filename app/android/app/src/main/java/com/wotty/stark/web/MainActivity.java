package com.wotty.stark.web;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebBackForwardList;
import android.webkit.WebHistoryItem;
import android.webkit.WebView;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onBackPressed() {
        WebView webView = this.bridge != null ? this.bridge.getWebView() : null;
        if (webView != null && shouldNavigateWebHistoryBack(webView)) {
            webView.goBack();
            return;
        }
        super.onBackPressed();
    }

    private boolean shouldNavigateWebHistoryBack(WebView webView) {
        if (!webView.canGoBack()) return false;
        try {
            WebBackForwardList history = webView.copyBackForwardList();
            int currentIndex = history.getCurrentIndex();
            if (currentIndex <= 0) return true;

            WebHistoryItem current = history.getItemAtIndex(currentIndex);
            WebHistoryItem previous = history.getItemAtIndex(currentIndex - 1);
            if (current == null || previous == null) return true;

            return WebViewBackNavigationPolicy.shouldNavigateWebHistoryBack(
                    current.getUrl(),
                    previous.getUrl());
        } catch (RuntimeException ignored) {
            // Do not make Android Back unresponsive if WebView history is
            // temporarily unavailable while the Activity is restoring.
            return true;
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppUpdatePlugin.class);
        super.onCreate(savedInstanceState);
        this.bridge.setWebViewClient(new StaticExportWebViewClient(this.bridge));
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        // Edge-to-edge: let the app draw under the system status / navigation bars
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (controller != null) {
            // light app background -> use dark icons in the status bar
            controller.setAppearanceLightStatusBars(true);
            controller.setAppearanceLightNavigationBars(true);
        }

        // Hide the native WebView scrollbars (CSS handles ::-webkit-scrollbar,
        // but the platform overlay scrollbar is not controlled by CSS).
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            webView.setVerticalScrollBarEnabled(false);
            webView.setHorizontalScrollBarEnabled(false);
            webView.setScrollBarStyle(WebView.SCROLLBARS_OUTSIDE_OVERLAY);
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        }
    }
}
