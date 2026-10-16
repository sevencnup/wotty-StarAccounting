package com.wotty.stark.web;

import android.net.Uri;
import android.os.Build;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;

import java.util.Map;

/** Serves each exported page when a local Next route is loaded directly. */
final class StaticExportWebViewClient extends BridgeWebViewClient {
    private final Uri localOrigin;
    private final boolean bundled;

    StaticExportWebViewClient(Bridge bridge) {
        super(bridge);
        localOrigin = Uri.parse(bridge.getLocalUrl());
        bundled = bridge.getServerUrl() == null;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri url = request.getUrl();
        String path = url.getPath();
        if (bundled && localOrigin.getScheme().equals(url.getScheme())
                && localOrigin.getAuthority().equals(url.getAuthority())
                && ("GET".equals(request.getMethod()) || "HEAD".equals(request.getMethod()))
                && path != null && path.matches("/app(?:/[a-z0-9-]+)*/?")) {
            // Capacitor's default SPA fallback serves /index.html for all
            // extensionless URLs, which is our login page, not this route.
            String documentPath = path.endsWith("/") ? path + "index.html" : path + "/index.html";
            Uri documentUrl = url.buildUpon().path(documentPath).build();
            // Delegate to Capacitor so native bridge injection and its normal
            // response handling are preserved. The visible URL stays unchanged.
            return super.shouldInterceptRequest(view, withUrl(request, documentUrl));
        }
        return super.shouldInterceptRequest(view, request);
    }

    private static WebResourceRequest withUrl(WebResourceRequest request, Uri url) {
        return new WebResourceRequest() {
            @Override
            public Uri getUrl() { return url; }

            @Override
            public boolean isForMainFrame() { return request.isForMainFrame(); }

            @Override
            public boolean isRedirect() {
                return Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && request.isRedirect();
            }

            @Override
            public boolean hasGesture() { return request.hasGesture(); }

            @Override
            public String getMethod() { return request.getMethod(); }

            @Override
            public Map<String, String> getRequestHeaders() { return request.getRequestHeaders(); }
        };
    }
}
