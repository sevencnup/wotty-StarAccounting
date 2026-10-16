package com.wotty.stark.web;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class WebViewBackNavigationPolicyTest {
    @Test
    public void closesManagedLayersBeforeConsideringTheTabPolicy() {
        assertTrue(WebViewBackNavigationPolicy.shouldNavigateWebHistoryBack(
                "http://localhost/app/savings/#starkDatePicker=picker-1",
                "http://localhost/app/savings/"));
    }

    @Test
    public void keepsSameOriginPrimaryTabsOutOfNativeBackHistory() {
        assertFalse(WebViewBackNavigationPolicy.shouldNavigateWebHistoryBack(
                "http://localhost/app/savings/",
                "http://localhost/app/consumption/"));
    }

    @Test
    public void keepsIndependentRoutesInNativeBackHistory() {
        assertTrue(WebViewBackNavigationPolicy.shouldNavigateWebHistoryBack(
                "http://localhost/app/journal/",
                "http://localhost/app/savings/"));
    }

    @Test
    public void keepsExternalHistoryAvailable() {
        assertTrue(WebViewBackNavigationPolicy.shouldNavigateWebHistoryBack(
                "http://localhost/app/assets/",
                "https://example.com/"));
    }
}
