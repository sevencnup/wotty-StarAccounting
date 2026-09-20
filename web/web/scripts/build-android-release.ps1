$ErrorActionPreference = "Stop"

function Normalize-BaseUrl {
  param(
    [string]$BaseUrl
  )

  if (-not $BaseUrl) {
    return ""
  }

  return $BaseUrl.Trim().TrimEnd("/")
}

function Resolve-NativeReleaseApiBaseUrl {
  $explicitNativeApiBaseUrl = Normalize-BaseUrl $env:NEXT_PUBLIC_NATIVE_DEFAULT_API_BASE_URL
  if ($explicitNativeApiBaseUrl) {
    return @{
      Url = $explicitNativeApiBaseUrl
      Source = "NEXT_PUBLIC_NATIVE_DEFAULT_API_BASE_URL"
    }
  }

  $browserApiBaseUrl = Normalize-BaseUrl $env:NEXT_PUBLIC_API_BASE_URL
  if ($browserApiBaseUrl) {
    return @{
      Url = $browserApiBaseUrl
      Source = "NEXT_PUBLIC_API_BASE_URL"
    }
  }

  return @{
    Url = ""
    Source = ""
  }
}

function Get-GradleCommand {
  param(
    [string]$AndroidProjectRoot
  )

  $wrapperPropsPath = Join-Path $AndroidProjectRoot "gradle\wrapper\gradle-wrapper.properties"
  $wrapperProps = Get-Content $wrapperPropsPath -Raw
  $distributionUrlMatch = [regex]::Match($wrapperProps, "distributionUrl=(.+)")

  if (-not $distributionUrlMatch.Success) {
    throw "Unable to locate Gradle distribution URL."
  }

  $distributionUrl = $distributionUrlMatch.Groups[1].Value.Trim().Replace("\:", ":")
  $versionMatch = [regex]::Match($distributionUrl, "gradle-([0-9.]+)-(bin|all)\.zip")

  if (-not $versionMatch.Success) {
    throw "Unable to parse Gradle version from distribution URL: $distributionUrl"
  }

  $gradleVersion = $versionMatch.Groups[1].Value
  $cachedGradle = Get-ChildItem (Join-Path $env:USERPROFILE ".gradle\wrapper\dists") -Recurse -Filter gradle.bat -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -like "*gradle-$gradleVersion*" } |
    Select-Object -First 1

  if ($cachedGradle) {
    return $cachedGradle.FullName
  }

  $gradleRoot = Join-Path $env:LOCALAPPDATA "Gradle"
  $gradleHome = Join-Path $gradleRoot ("gradle-{0}" -f $gradleVersion)
  $gradleCmd = Join-Path $gradleHome "bin\gradle.bat"

  if (-not (Test-Path $gradleCmd)) {
    New-Item -ItemType Directory -Force -Path $gradleRoot | Out-Null
    $gradleZip = Join-Path $env:TEMP ("gradle-{0}.zip" -f $gradleVersion)
    Invoke-WebRequest -Uri $distributionUrl -OutFile $gradleZip
    Expand-Archive -Path $gradleZip -DestinationPath $gradleRoot -Force
  }

  if (-not (Test-Path $gradleCmd)) {
    throw "Gradle command not found at: $gradleCmd"
  }

  return $gradleCmd
}

function Initialize-AndroidBuildEnvironment {
  if (-not $env:ANDROID_SDK_ROOT) {
    $env:ANDROID_SDK_ROOT = Join-Path $env:LOCALAPPDATA "Android\Sdk"
  }
  if (-not $env:ANDROID_HOME) {
    $env:ANDROID_HOME = $env:ANDROID_SDK_ROOT
  }
  if (-not $env:JAVA_HOME) {
    $studioCmd = Get-Command studio64.exe -ErrorAction SilentlyContinue
    if ($studioCmd) {
      $studioRoot = Split-Path -Parent (Split-Path -Parent $studioCmd.Source)
      $studioJbr = Join-Path $studioRoot "jbr"
      if (Test-Path (Join-Path $studioJbr "bin\java.exe")) {
        $env:JAVA_HOME = $studioJbr
      }
    }

    if (-not $env:JAVA_HOME) {
      $javaExe = (Get-Command java.exe).Source
      $env:JAVA_HOME = Split-Path -Parent (Split-Path -Parent $javaExe)
    }
  }
}

function Resolve-ReleaseArtifactPath {
  param(
    [string]$ProjectRoot
  )

  $releaseOutputDir = Join-Path $ProjectRoot "android\app\build\outputs\apk\release"
  $signedApk = Join-Path $releaseOutputDir "app-release.apk"
  $unsignedApk = Join-Path $releaseOutputDir "app-release-unsigned.apk"

  if (Test-Path $signedApk) {
    return @{
      Path = $signedApk
      Signed = $true
    }
  }

  if (Test-Path $unsignedApk) {
    return @{
      Path = $unsignedApk
      Signed = $false
    }
  }

  throw "Release APK not found in: $releaseOutputDir"
}

function Invoke-GradleReleaseBuild {
  param(
    [string]$GradleCmd
  )

  & $GradleCmd :app:assembleRelease --offline
  if ($LASTEXITCODE -eq 0) {
    return
  }

  Write-Host "Offline release build failed. Retrying with network access to resolve missing dependencies..."
  & $GradleCmd :app:assembleRelease

  if ($LASTEXITCODE -ne 0) {
    throw "Gradle assembleRelease failed with exit code $LASTEXITCODE"
  }
}

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# Refresh Android launcher assets before packaging so the APK uses the latest app logo.
$updateIconsScript = Join-Path $PSScriptRoot "update-android-icons.ps1"
if (Test-Path $updateIconsScript) {
  Write-Host "Refreshing Android app icon assets..."
  & $updateIconsScript
}

Initialize-AndroidBuildEnvironment

if (-not (Test-Path "android")) {
  npx cap add android
}

$browserApiBaseUrl = Normalize-BaseUrl $env:NEXT_PUBLIC_API_BASE_URL
$nativeApiBaseUrl = Resolve-NativeReleaseApiBaseUrl

if ($browserApiBaseUrl) {
  Write-Host "Using web API base URL from environment: $browserApiBaseUrl"
} else {
  Write-Host "No web API base URL override provided. Browser build will use same-origin /api when opened in a browser."
}

if ($nativeApiBaseUrl.Url) {
  $env:NEXT_PUBLIC_NATIVE_DEFAULT_API_BASE_URL = $nativeApiBaseUrl.Url
  Write-Host "Release APK native API base URL: $($nativeApiBaseUrl.Url) (source: $($nativeApiBaseUrl.Source))"
} else {
  Remove-Item Env:NEXT_PUBLIC_NATIVE_DEFAULT_API_BASE_URL -ErrorAction SilentlyContinue
  Write-Host "No native API base URL override provided. Release APK will require manual server configuration before login."
}

$sdkDirEscaped = $env:ANDROID_SDK_ROOT.Replace("\", "\\")
@(
  "## This file is auto-generated by web/scripts/build-android-release.ps1",
  "sdk.dir=$sdkDirEscaped"
) | Set-Content -Path "android\local.properties" -Encoding UTF8

$hasReleaseSigning = $env:wotty_RELEASE_STORE_FILE -and $env:wotty_RELEASE_STORE_PASSWORD -and $env:wotty_RELEASE_KEY_ALIAS -and $env:wotty_RELEASE_KEY_PASSWORD
if ($hasReleaseSigning) {
  Write-Host "Release signing detected. The output APK will be signed."
} else {
  Write-Host "No release signing info detected. The output APK will be an unsigned release artifact."
}

npm run build:export
npx cap sync android

$versionName = "dev"
$buildGradle = Get-Content "android\app\build.gradle" -Raw
$versionMatch = [regex]::Match($buildGradle, 'versionName\s+"([^"]+)"')
if ($versionMatch.Success) {
  $versionName = $versionMatch.Groups[1].Value
}

Push-Location "android"
try {
  $gradleCmd = Get-GradleCommand -AndroidProjectRoot $PWD.Path
  Invoke-GradleReleaseBuild -GradleCmd $gradleCmd
} finally {
  Pop-Location
}

$releaseArtifact = Resolve-ReleaseArtifactPath -ProjectRoot $projectRoot
$artifactDir = Join-Path $projectRoot "dist-apk"
New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null

$targetFileName = if ($releaseArtifact.Signed) {
  "wotty-android-release-$versionName.apk"
} else {
  "wotty-android-release-$versionName-unsigned.apk"
}

$targetApk = Join-Path $artifactDir $targetFileName
Copy-Item -Path $releaseArtifact.Path -Destination $targetApk -Force

Write-Host "Release APK generated: $targetApk"
if (-not $releaseArtifact.Signed) {
  Write-Host "This artifact is unsigned. Configure wotty_RELEASE_* environment variables when you want an installable signed release package."
}
