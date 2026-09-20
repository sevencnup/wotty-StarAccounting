package com.wotty.star_accounting;

import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;

import androidx.core.content.pm.PackageInfoCompat;

import com.getcapacitor.BridgeActivity;

import java.io.File;

public class MainActivity extends BridgeActivity {
    private static final String RUNTIME_PREFS = "wotty_runtime";
    private static final String KEY_LAST_WEBVIEW_RUNTIME_CLEANUP_VERSION = "last_webview_runtime_cleanup_version";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        clearStaleWebViewRuntimeOnAppUpdate();
        super.onCreate(savedInstanceState);
    }

    private void clearStaleWebViewRuntimeOnAppUpdate() {
        SharedPreferences preferences = getSharedPreferences(RUNTIME_PREFS, MODE_PRIVATE);
        int cleanedVersionCode = preferences.getInt(KEY_LAST_WEBVIEW_RUNTIME_CLEANUP_VERSION, 0);
        int currentVersionCode = resolveCurrentVersionCode();

        if (cleanedVersionCode >= currentVersionCode) {
            return;
        }

        File webViewRoot = new File(getApplicationInfo().dataDir, "app_webview");
        deleteRecursively(new File(webViewRoot, "Default/Service Worker"));
        deleteRecursively(new File(webViewRoot, "Default/Cache"));
        deleteRecursively(new File(webViewRoot, "Default/Code Cache"));
        deleteRecursively(new File(webViewRoot, "Default/GPUCache"));

        preferences.edit().putInt(KEY_LAST_WEBVIEW_RUNTIME_CLEANUP_VERSION, currentVersionCode).apply();
    }

    private int resolveCurrentVersionCode() {
        try {
            PackageInfo packageInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            long versionCode = PackageInfoCompat.getLongVersionCode(packageInfo);
            return (int) Math.min(Integer.MAX_VALUE, versionCode);
        } catch (PackageManager.NameNotFoundException exception) {
            return 0;
        }
    }

    private void deleteRecursively(File target) {
        if (target == null || !target.exists()) {
            return;
        }

        if (target.isDirectory()) {
            File[] children = target.listFiles();
            if (children != null) {
                for (File child : children) {
                    deleteRecursively(child);
                }
            }
        }

        // Ignore delete failures here because the goal is best-effort cleanup during app upgrade.
        target.delete();
    }
}
