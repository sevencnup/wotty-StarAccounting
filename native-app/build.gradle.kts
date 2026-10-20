import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

plugins {
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.kotlinAndroid)
    alias(libs.plugins.composeCompiler)
}

android {
    namespace = "com.wotty.stark.nativeapp"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.wotty.stark.nativeapp"
        minSdk = 26
        targetSdk = 35
        versionCode = 10040
        versionName = "0.21.0-dev.8"
        manifestPlaceholders["appLabel"] = "星会计 原生版"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        debug {
            val debugSuffix = providers.gradleProperty("nativeDebugApplicationIdSuffix").orNull
            if (!debugSuffix.isNullOrBlank()) {
                applicationIdSuffix = debugSuffix
                manifestPlaceholders["appLabel"] = "星会计 原生版（调试副本）"
            }
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    implementation(platform(libs.compose.bom))
    implementation(libs.activity.compose)
    implementation(libs.compose.ui)
    implementation(libs.compose.ui.graphics)
    implementation(libs.compose.ui.tooling.preview)
    implementation(libs.compose.material3)
    implementation(libs.compose.material.icons.extended)
    implementation(libs.compose.foundation)
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("net.sourceforge.jexcelapi:jxl:2.6.12")

    debugImplementation(libs.compose.ui.tooling)
    testImplementation("junit:junit:4.13.2")
}

val archivedDebugApkName = providers.provider {
    val timestamp = SimpleDateFormat("yyyyMMdd-HHmmss", Locale.ROOT).format(Date())
    val debugSuffix = providers.gradleProperty("nativeDebugApplicationIdSuffix").orNull.orEmpty()
        .removePrefix(".")
        .replace('.', '-')
        .takeIf(String::isNotBlank)
        ?.let { "-$it" }
        .orEmpty()
    "wotty-stark-native$debugSuffix-debug-v${android.defaultConfig.versionName}-c${android.defaultConfig.versionCode}-$timestamp.apk"
}

tasks.register<Copy>("archiveNativeDebugApk") {
    from(layout.buildDirectory.dir("outputs/apk/debug")) {
        include("native-app-debug.apk")
        rename { archivedDebugApkName.get() }
    }
    into(rootProject.layout.projectDirectory.dir("releases"))
}

tasks.configureEach {
    if (name == "assembleDebug") finalizedBy("archiveNativeDebugApk")
}
