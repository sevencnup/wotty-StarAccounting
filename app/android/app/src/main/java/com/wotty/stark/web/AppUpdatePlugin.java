package com.wotty.stark.web;

import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.ConnectException;
import java.net.HttpURLConnection;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(name = "AppUpdate")
public class AppUpdatePlugin extends Plugin {
    private static final long MAX_APK_BYTES = 500L * 1024 * 1024;
    private static final String PROGRESS_EVENT = "downloadProgress";
    private static final int CONNECT_TIMEOUT_MS = 45_000;
    private static final int READ_TIMEOUT_MS = 120_000;
    private static final int MAX_DOWNLOAD_ATTEMPTS = 2;

    private final AtomicBoolean downloading = new AtomicBoolean(false);
    private volatile File downloadedFile;
    private volatile String downloadedUrl;

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String source = call.getString("url");
        Integer expectedVersionCode = call.getInt("versionCode");
        if (source == null || expectedVersionCode == null || expectedVersionCode <= 0) {
            call.reject("更新地址或版本信息无效，请重新检查更新。");
            return;
        }

        try {
            requireHttps(new URL(source));
        } catch (Exception ignored) {
            call.reject("更新地址必须是有效的 HTTPS 链接。");
            return;
        }

        if (!downloading.compareAndSet(false, true)) {
            call.reject("安装包正在下载，请稍候。");
            return;
        }

        bridge.execute(() -> {
            try {
                File apk = downloadedFile;
                if (!source.equals(downloadedUrl) || apk == null || !apk.isFile() ||
                        !isValidApk(apk, expectedVersionCode)) {
                    downloadedFile = null;
                    downloadedUrl = null;
                    apk = downloadApk(source);
                    if (!isValidApk(apk, expectedVersionCode)) {
                        apk.delete();
                        throw new IOException("安装包与当前星会计版本不匹配，请重新检查更新。");
                    }
                    downloadedFile = apk;
                    downloadedUrl = source;
                }

                File installFile = apk;
                getActivity().runOnUiThread(() -> {
                    downloading.set(false);
                    openInstaller(call, installFile);
                });
            } catch (IOException error) {
                downloading.set(false);
                call.reject(error.getMessage() == null ? "下载失败，请稍后重试。" : error.getMessage());
            } catch (Exception error) {
                downloading.set(false);
                call.reject("下载失败，请检查网络后重试。");
            }
        });
    }

    @PluginMethod
    public void openDownloadInBrowser(PluginCall call) {
        String source = call.getString("url");
        try {
            requireHttps(new URL(source == null ? "" : source));
            Intent browser = new Intent(Intent.ACTION_VIEW, Uri.parse(source));
            browser.addCategory(Intent.CATEGORY_BROWSABLE);
            getActivity().startActivity(browser);
            call.resolve(new JSObject().put("opened", true));
        } catch (Exception ignored) {
            call.reject("无法打开浏览器，请从关于页面进入项目网站下载更新。");
        }
    }

    private File downloadApk(String source) throws IOException {
        IOException lastError = null;
        for (int attempt = 1; attempt <= MAX_DOWNLOAD_ATTEMPTS; attempt++) {
            try {
                return downloadApkOnce(source);
            } catch (IOException error) {
                lastError = error;
                if (attempt == MAX_DOWNLOAD_ATTEMPTS || !isRetryableDownloadError(error)) {
                    throw readableDownloadError(error);
                }
            }
        }
        throw readableDownloadError(lastError);
    }

    private File downloadApkOnce(String source) throws IOException {
        File directory = new File(getContext().getCacheDir(), "app-updates");
        if (!directory.isDirectory() && !directory.mkdirs()) {
            throw new IOException("无法创建安装包缓存目录。");
        }
        File target = new File(directory, "star-accounting-update.apk");
        File temporary = new File(directory, "star-accounting-update.apk.part");
        if (temporary.exists() && !temporary.delete()) {
            throw new IOException("无法清理上次未完成的下载。");
        }

        HttpURLConnection connection = openHttpsConnection(source);
        boolean completed = false;
        try {
            long total = connection.getContentLength();
            if (total > MAX_APK_BYTES) throw new IOException("安装包过大，已停止下载。");

            long received = 0;
            long lastReportTime = 0;
            byte[] buffer = new byte[64 * 1024];
            reportProgress("downloading", 0, total);
            try (InputStream input = connection.getInputStream();
                 FileOutputStream output = new FileOutputStream(temporary)) {
                int count;
                while ((count = input.read(buffer)) != -1) {
                    received += count;
                    if (received > MAX_APK_BYTES) throw new IOException("安装包过大，已停止下载。");
                    output.write(buffer, 0, count);
                    long now = System.currentTimeMillis();
                    if (now - lastReportTime >= 250) {
                        reportProgress("downloading", received, total);
                        lastReportTime = now;
                    }
                }
            }

            if (received == 0 || (total > 0 && received != total)) {
                throw new IOException("安装包下载不完整，请重试。");
            }
            if (target.exists() && !target.delete()) throw new IOException("无法替换旧安装包缓存。");
            if (!temporary.renameTo(target)) throw new IOException("无法保存已下载的安装包。");
            completed = true;
            reportProgress("downloading", received, received);
            return target;
        } finally {
            connection.disconnect();
            if (!completed) temporary.delete();
        }
    }

    private HttpURLConnection openHttpsConnection(String source) throws IOException {
        URL current = requireHttps(new URL(source));
        for (int redirects = 0; redirects <= 5; redirects++) {
            HttpURLConnection connection = (HttpURLConnection) current.openConnection();
            connection.setInstanceFollowRedirects(false);
            connection.setConnectTimeout(CONNECT_TIMEOUT_MS);
            connection.setReadTimeout(READ_TIMEOUT_MS);
            connection.setUseCaches(false);
            connection.setRequestProperty("Accept", "application/vnd.android.package-archive, application/octet-stream");
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android) AppleWebKit/537.36 Mobile Safari/537.36 StarAccounting-App");
            try {
                int status = connection.getResponseCode();
                if (status == HttpURLConnection.HTTP_OK) return connection;
                if (status == HttpURLConnection.HTTP_MOVED_PERM ||
                        status == HttpURLConnection.HTTP_MOVED_TEMP ||
                        status == HttpURLConnection.HTTP_SEE_OTHER ||
                        status == 307 || status == 308) {
                    String location = connection.getHeaderField("Location");
                    if (location == null) throw new IOException("安装包下载地址无效。");
                    current = requireHttps(new URL(current, location));
                    connection.disconnect();
                    continue;
                }
                throw new IOException("服务器暂时无法提供安装包（HTTP " + status + "）。");
            } catch (IOException error) {
                connection.disconnect();
                throw error;
            }
        }
        throw new IOException("安装包下载地址跳转次数过多。");
    }

    private boolean isRetryableDownloadError(IOException error) {
        Throwable cause = error;
        while (cause != null) {
            if (cause instanceof SocketTimeoutException || cause instanceof ConnectException ||
                    cause instanceof UnknownHostException) return true;
            cause = cause.getCause();
        }
        return false;
    }

    private IOException readableDownloadError(IOException error) {
        if (error == null) return new IOException("下载失败，请稍后重试。");
        Throwable cause = error;
        while (cause != null) {
            if (cause instanceof SocketTimeoutException) {
                return new IOException("下载连接超时，请点击下方“下载更新”改用浏览器下载。", error);
            }
            if (cause instanceof ConnectException || cause instanceof UnknownHostException) {
                return new IOException("无法连接下载服务器，请检查网络后重试。", error);
            }
            cause = cause.getCause();
        }
        return error;
    }

    private URL requireHttps(URL url) throws IOException {
        if (!"https".equalsIgnoreCase(url.getProtocol()) || url.getHost().isEmpty() ||
                url.getUserInfo() != null) {
            throw new IOException("更新地址必须是有效的 HTTPS 链接。");
        }
        return url;
    }

    private boolean isValidApk(File apk, int expectedVersionCode) {
        if (!apk.isFile() || apk.length() == 0 || apk.length() > MAX_APK_BYTES) return false;
        PackageInfo archive = getContext().getPackageManager().getPackageArchiveInfo(apk.getAbsolutePath(), 0);
        if (archive == null || !getContext().getPackageName().equals(archive.packageName)) return false;
        try {
            PackageInfo installed = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            return versionCode(archive) == expectedVersionCode && versionCode(archive) > versionCode(installed);
        } catch (Exception ignored) {
            return false;
        }
    }

    @SuppressWarnings("deprecation")
    private long versionCode(PackageInfo packageInfo) {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.P
                ? packageInfo.getLongVersionCode() : packageInfo.versionCode;
    }

    private void openInstaller(PluginCall call, File apk) {
        if (!apk.isFile()) {
            call.reject("安装包缓存已清理，请重新下载。");
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
                !getContext().getPackageManager().canRequestPackageInstalls()) {
            reportProgress("permission", apk.length(), apk.length());
            Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:" + getContext().getPackageName()));
            try {
                startActivityForResult(call, settings, "onInstallPermissionResult");
            } catch (Exception ignored) {
                call.reject("无法打开安装权限设置，请在系统设置中允许星会计安装应用。");
            }
            return;
        }

        try {
            Uri uri = FileProvider.getUriForFile(getContext(),
                    getContext().getPackageName() + ".fileprovider", apk);
            Intent install = new Intent(Intent.ACTION_VIEW);
            install.setDataAndType(uri, "application/vnd.android.package-archive");
            install.setClipData(ClipData.newUri(getContext().getContentResolver(), "星会计更新", uri));
            install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(install);
            call.resolve(new JSObject().put("installationStarted", true));
        } catch (Exception ignored) {
            call.reject("无法打开系统安装界面，请稍后重试。");
        }
    }

    @ActivityCallback
    private void onInstallPermissionResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
                !getContext().getPackageManager().canRequestPackageInstalls()) {
            call.reject("请在系统设置中允许星会计安装应用，再点击重试。");
            return;
        }
        File apk = downloadedFile;
        Integer expectedVersionCode = call.getInt("versionCode");
        if (apk == null || expectedVersionCode == null || !isValidApk(apk, expectedVersionCode)) {
            call.reject("安装包缓存已失效，请重新下载。");
            return;
        }
        openInstaller(call, apk);
    }

    private void reportProgress(String stage, long received, long total) {
        JSObject progress = new JSObject();
        progress.put("stage", stage);
        progress.put("downloadedBytes", received);
        progress.put("totalBytes", total > 0 ? total : 0);
        if (total > 0) progress.put("percent", Math.min(100, (int) (received * 100 / total)));
        getActivity().runOnUiThread(() -> notifyListeners(PROGRESS_EVENT, progress));
    }
}
