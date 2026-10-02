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
        versionCode = 10000
        versionName = "0.1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
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

    debugImplementation(libs.compose.ui.tooling)
    testImplementation("junit:junit:4.13.2")
}

val archivedDebugApkName = providers.provider {
    val timestamp = SimpleDateFormat("yyyyMMdd-HHmmss", Locale.ROOT).format(Date())
    "wotty-stark-native-debug-v${android.defaultConfig.versionName}-c${android.defaultConfig.versionCode}-$timestamp.apk"
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
