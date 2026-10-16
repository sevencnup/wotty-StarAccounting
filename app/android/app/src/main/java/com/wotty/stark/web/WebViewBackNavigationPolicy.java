package com.wotty.stark.web;

import java.net.URI;
import java.net.URISyntaxException;

/**
 * Keeps Android system back from treating peer bottom tabs as a drill-down
 * history. Managed web layers use a #stark... marker and route pages remain
 * regular WebView history entries.
 */
final class WebViewBackNavigationPolicy {
    private WebViewBackNavigationPolicy() {
    }

    static boolean shouldNavigateWebHistoryBack(String currentUrl, String previousUrl) {
        URI current = parse(currentUrl);
        URI previous = parse(previousUrl);

        // Preserve the old behavior for URLs we cannot classify safely.
        if (current == null || previous == null) return true;
        if (hasManagedLayerMarker(current)) return true;
        if (!isPrimaryTab(current)) return true;

        // A main tab reached from another same-origin app URL is a new root
        // state. Let Android handle Back instead of reviving a stale tab,
        // login route, or other old application page.
        return !hasSameOrigin(current, previous);
    }

    private static URI parse(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return new URI(value);
        } catch (URISyntaxException ignored) {
            return null;
        }
    }

    private static boolean hasManagedLayerMarker(URI uri) {
        String fragment = uri.getFragment();
        return fragment != null && fragment.startsWith("stark");
    }

    private static boolean isPrimaryTab(URI uri) {
        String path = uri.getPath();
        if (path == null || path.isEmpty()) return false;
        while (path.length() > 1 && path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }
        return "/app".equals(path)
                || "/app/consumption".equals(path)
                || "/app/savings".equals(path)
                || "/app/loans".equals(path)
                || "/app/assets".equals(path)
                || "/app/accounts".equals(path);
    }

    private static boolean hasSameOrigin(URI current, URI previous) {
        String currentScheme = current.getScheme();
        String previousScheme = previous.getScheme();
        String currentHost = current.getHost();
        String previousHost = previous.getHost();
        return currentScheme != null
                && currentHost != null
                && currentScheme.equalsIgnoreCase(previousScheme)
                && currentHost.equalsIgnoreCase(previousHost)
                && current.getPort() == previous.getPort();
    }
}
