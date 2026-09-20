[CmdletBinding()]
param(
  [string]$DeployHost = $env:wotty_DIRECT_HOST,
  [string]$DeployUser = $env:wotty_DIRECT_USER,
  [int]$DeployPort = $(if ($env:wotty_DIRECT_PORT) { [int]$env:wotty_DIRECT_PORT } else { 22 }),
  [string]$RemoteAppDir = $env:wotty_DIRECT_APP_DIR,
  [string]$SshKeyPath = $env:wotty_DIRECT_KEY_PATH,
  [string]$ServerProcessName = "wotty-server",
  [string]$WebProcessName = "wotty-web",
  [string]$ServerHealthcheckUrl = "http://127.0.0.1:3006/api/health",
  [string]$WebHealthcheckUrl = "http://127.0.0.1:3000/",
  [switch]$SkipBuild,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-DeployLog {
  param([string]$Message)
  Write-Host "[deploy] $Message"
}

function Resolve-Command {
  param([string[]]$Candidates)

  foreach ($candidate in $Candidates) {
    $command = Get-Command $candidate -ErrorAction SilentlyContinue
    if ($command) {
      return $command.Source
    }
  }

  throw "Missing required command: $($Candidates -join ', ')"
}

function Invoke-Native {
  param(
    [string]$FilePath,
    [string[]]$Arguments = @(),
    [string]$WorkingDirectory = (Get-Location).Path
  )

  Push-Location $WorkingDirectory
  try {
    Write-DeployLog "$FilePath $($Arguments -join ' ')"
    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "Command failed with exit code ${LASTEXITCODE}: $FilePath $($Arguments -join ' ')"
    }
  } finally {
    Pop-Location
  }
}

function Get-ResolvedValue {
  param(
    [string]$Value,
    [string]$Prompt,
    [string]$Default = ""
  )

  if ($Value) {
    return $Value.Trim()
  }

  if ($DryRun) {
    if ($Default) {
      return $Default
    }
    return "<required>"
  }

  if ($Default) {
    $inputValue = Read-Host "$Prompt [$Default]"
    if (-not [string]::IsNullOrWhiteSpace($inputValue)) {
      return $inputValue.Trim()
    }
    return $Default
  }

  $inputValue = Read-Host $Prompt
  if ([string]::IsNullOrWhiteSpace($inputValue)) {
    throw "$Prompt is required."
  }
  return $inputValue.Trim()
}

function Load-DotEnvValues {
  param([string[]]$Paths)

  $values = @{}

  foreach ($path in $Paths) {
    if (-not (Test-Path -LiteralPath $path)) {
      continue
    }

    foreach ($line in Get-Content -LiteralPath $path) {
      if ([string]::IsNullOrWhiteSpace($line)) {
        continue
      }

      $trimmed = $line.Trim()
      if ($trimmed.StartsWith("#")) {
        continue
      }

      $match = [regex]::Match($line, '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$')
      if (-not $match.Success) {
        continue
      }

      $name = $match.Groups[1].Value
      $rawValue = $match.Groups[2].Value.Trim()
      if ($rawValue.Length -ge 2) {
        if (($rawValue.StartsWith('"') -and $rawValue.EndsWith('"')) -or ($rawValue.StartsWith("'") -and $rawValue.EndsWith("'"))) {
          $rawValue = $rawValue.Substring(1, $rawValue.Length - 2)
        }
      }

      $values[$name] = $rawValue
    }
  }

  return $values
}

function Load-DeployConfig {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return $null
  }

  return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
}

function Get-ConfigValue {
  param(
    [object]$Config,
    [string[]]$Path
  )

  $current = $Config
  foreach ($segment in $Path) {
    if ($null -eq $current) {
      return $null
    }

    $property = $current.PSObject.Properties[$segment]
    if (-not $property) {
      return $null
    }

    $current = $property.Value
  }

  return $current
}

function Quote-ForPosix {
  param([string]$Value)

  return "'" + ($Value -replace "'", "'""'""'") + "'"
}

function Remove-IfExists {
  param([string]$LiteralPath)

  if (Test-Path -LiteralPath $LiteralPath) {
    Remove-Item -LiteralPath $LiteralPath -Force
  }
}

$script:NpmBin = Resolve-Command @("npm.cmd", "npm")
$script:NpxBin = Resolve-Command @("npx.cmd", "npx")
$script:TarBin = Resolve-Command @("tar.exe", "tar")
$script:SshBin = Resolve-Command @("ssh.exe", "ssh")
$script:ScpBin = Resolve-Command @("scp.exe", "scp")

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerDir = Join-Path $RepoRoot "server"
$WebDir = Join-Path $RepoRoot "web"
$DefaultRemoteAppDir = "/www/wwwroot/staraccountting.sevencn.com"
$ConfigPath = Join-Path $RepoRoot "deploy-config.json"
$DotEnvValues = Load-DotEnvValues -Paths @(
  (Join-Path $RepoRoot ".env"),
  (Join-Path $RepoRoot ".env.local")
)
$DeployConfig = Load-DeployConfig -Path $ConfigPath

if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot ".git"))) {
  throw "Repository root not found: $RepoRoot"
}
if (-not (Test-Path -LiteralPath $ServerDir)) {
  throw "Missing backend directory: $ServerDir"
}
if (-not (Test-Path -LiteralPath $WebDir)) {
  throw "Missing frontend directory: $WebDir"
}

if (-not $DeployHost) {
  $DeployHost = $DotEnvValues["wotty_DIRECT_HOST"]
}
if (-not $DeployHost) {
  $DeployHost = Get-ConfigValue -Config $DeployConfig -Path @("server", "host")
}

if (-not $DeployUser) {
  $DeployUser = $DotEnvValues["wotty_DIRECT_USER"]
}
if (-not $DeployUser) {
  $DeployUser = Get-ConfigValue -Config $DeployConfig -Path @("server", "username")
}

$portWasDefault = -not $PSBoundParameters.ContainsKey("DeployPort") -and -not $env:wotty_DIRECT_PORT
if ($portWasDefault) {
  if ($DotEnvValues.ContainsKey("wotty_DIRECT_PORT")) {
    $DeployPort = [int]$DotEnvValues["wotty_DIRECT_PORT"]
  } else {
    $configPort = Get-ConfigValue -Config $DeployConfig -Path @("server", "port")
    if ($configPort) {
      $DeployPort = [int]$configPort
    }
  }
}

if (-not $RemoteAppDir) {
  $RemoteAppDir = $DotEnvValues["wotty_DIRECT_APP_DIR"]
}
if (-not $RemoteAppDir) {
  $RemoteAppDir = Get-ConfigValue -Config $DeployConfig -Path @("server", "appDir")
}

if (-not $SshKeyPath) {
  $SshKeyPath = $DotEnvValues["wotty_DIRECT_KEY_PATH"]
}
if (-not $SshKeyPath) {
  $SshKeyPath = Get-ConfigValue -Config $DeployConfig -Path @("server", "keyPath")
}

if (-not $PSBoundParameters.ContainsKey("ServerProcessName")) {
  $configServerProcessName = Get-ConfigValue -Config $DeployConfig -Path @("process", "serverName")
  if ($configServerProcessName) {
    $ServerProcessName = [string]$configServerProcessName
  }
}

if (-not $PSBoundParameters.ContainsKey("WebProcessName")) {
  $configWebProcessName = Get-ConfigValue -Config $DeployConfig -Path @("process", "webName")
  if ($configWebProcessName) {
    $WebProcessName = [string]$configWebProcessName
  }
}

if (-not $PSBoundParameters.ContainsKey("ServerHealthcheckUrl")) {
  $configServerHealthUrl = Get-ConfigValue -Config $DeployConfig -Path @("health", "serverUrl")
  if ($configServerHealthUrl) {
    $ServerHealthcheckUrl = [string]$configServerHealthUrl
  }
}

if (-not $PSBoundParameters.ContainsKey("WebHealthcheckUrl")) {
  $configWebHealthUrl = Get-ConfigValue -Config $DeployConfig -Path @("health", "webUrl")
  if ($configWebHealthUrl) {
    $WebHealthcheckUrl = [string]$configWebHealthUrl
  }
}

$DeployHost = Get-ResolvedValue -Value $DeployHost -Prompt "SSH host"
$DeployUser = Get-ResolvedValue -Value $DeployUser -Prompt "SSH username"
$RemoteAppDir = Get-ResolvedValue -Value $RemoteAppDir -Prompt "Remote app dir" -Default $DefaultRemoteAppDir

if ($SshKeyPath) {
  $SshKeyPath = (Resolve-Path -LiteralPath $SshKeyPath).Path
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archivePath = Join-Path $env:TEMP ("wotty-staraccounting-direct-{0}.tar.gz" -f $timestamp)
$remotePackagePath = "$RemoteAppDir/.deploy-tmp/wotty-staraccounting-direct-$timestamp.tar.gz"
$remoteTarget = "{0}@{1}" -f $DeployUser, $DeployHost

Write-DeployLog "Repository root: $RepoRoot"
Write-DeployLog "Config file: $ConfigPath"
Write-DeployLog "SSH target: $remoteTarget"
Write-DeployLog "Remote app dir: $RemoteAppDir"
Write-DeployLog "Remote package path: $remotePackagePath"

if ($DryRun) {
  Write-DeployLog "Dry run enabled. No build, package or upload will be executed."
  return
}

if (-not $SkipBuild) {
  Write-DeployLog "Installing and building backend"
  Invoke-Native -FilePath $script:NpmBin -Arguments @("ci") -WorkingDirectory $ServerDir
  Invoke-Native -FilePath $script:NpxBin -Arguments @("prisma", "generate") -WorkingDirectory $ServerDir
  Invoke-Native -FilePath $script:NpmBin -Arguments @("run", "build") -WorkingDirectory $ServerDir

  Write-DeployLog "Installing and building frontend"
  Invoke-Native -FilePath $script:NpmBin -Arguments @("ci") -WorkingDirectory $WebDir
  Invoke-Native -FilePath $script:NpmBin -Arguments @("run", "build") -WorkingDirectory $WebDir
} else {
  Write-DeployLog "SkipBuild enabled. Local build verification was skipped."
}

Write-DeployLog "Creating deployment archive"
Remove-IfExists -LiteralPath $archivePath
$tarArguments = @(
  "-czf", $archivePath,
  "--exclude=.git",
  "--exclude=.github",
  "--exclude=.claude",
  "--exclude=.cunzhi-memory",
  "--exclude=node_modules",
  "--exclude=*/node_modules",
  "--exclude=.next",
  "--exclude=*/.next",
  "--exclude=dist",
  "--exclude=*/dist",
  "--exclude=out",
  "--exclude=*/out",
  "--exclude=playwright-report",
  "--exclude=*/playwright-report",
  "--exclude=dist-apk",
  "--exclude=*/dist-apk",
  "--exclude=android",
  "--exclude=web/android",
  "--exclude=.env",
  "--exclude=*/.env",
  "--exclude=.env.local",
  "--exclude=*/.env.local",
  "--exclude=.env.production",
  "--exclude=*/.env.production",
  "--exclude=dev-run.err.log",
  "--exclude=dev-run.out.log",
  "--exclude=server-build.zip",
  "--exclude=web-build-new.zip",
  "--exclude=tmp_analytics_excerpt.txt",
  "server",
  "web"
)
Invoke-Native -FilePath $script:TarBin -Arguments $tarArguments -WorkingDirectory $RepoRoot

$sshCommonArguments = @(
  "-p", $DeployPort.ToString(),
  "-o", "BatchMode=no",
  "-o", "StrictHostKeyChecking=accept-new"
)
$scpCommonArguments = @(
  "-P", $DeployPort.ToString(),
  "-o", "BatchMode=no",
  "-o", "StrictHostKeyChecking=accept-new"
)

if ($SshKeyPath) {
  $sshCommonArguments += @("-i", $SshKeyPath)
  $scpCommonArguments += @("-i", $SshKeyPath)
}

$mkdirCommand = "mkdir -p " + (Quote-ForPosix "$RemoteAppDir/.deploy-tmp")
Invoke-Native -FilePath $script:SshBin -Arguments @($sshCommonArguments + $remoteTarget + $mkdirCommand)

Write-DeployLog "Uploading deployment archive"
Invoke-Native -FilePath $script:ScpBin -Arguments @($scpCommonArguments + $archivePath + ("{0}:{1}" -f $remoteTarget, $remotePackagePath))

$quotedAppDir = Quote-ForPosix $RemoteAppDir
$quotedPackage = Quote-ForPosix $remotePackagePath
$quotedServerProcessName = Quote-ForPosix $ServerProcessName
$quotedWebProcessName = Quote-ForPosix $WebProcessName
$quotedServerHealthUrl = Quote-ForPosix $ServerHealthcheckUrl
$quotedWebHealthUrl = Quote-ForPosix $WebHealthcheckUrl

$remoteDeployCommand = @"
set -Eeuo pipefail
APP_DIR=$quotedAppDir
PACKAGE=$quotedPackage
TMP_RELEASE_DIR="\$APP_DIR/.deploy-tmp/release-$timestamp"

mkdir -p "\$TMP_RELEASE_DIR"
tar -xzf "\$PACKAGE" -C "\$TMP_RELEASE_DIR"

if [ -f "\$APP_DIR/server/.env" ]; then
  cp "\$APP_DIR/server/.env" "\$TMP_RELEASE_DIR/server/.env"
fi
if [ -f "\$APP_DIR/web/.env" ]; then
  cp "\$APP_DIR/web/.env" "\$TMP_RELEASE_DIR/web/.env"
fi
if [ -f "\$APP_DIR/web/.env.local" ]; then
  cp "\$APP_DIR/web/.env.local" "\$TMP_RELEASE_DIR/web/.env.local"
fi
if [ -f "\$APP_DIR/web/.env.production" ]; then
  cp "\$APP_DIR/web/.env.production" "\$TMP_RELEASE_DIR/web/.env.production"
fi

rm -rf "\$APP_DIR/server" "\$APP_DIR/web"
mkdir -p "\$APP_DIR"
cp -a "\$TMP_RELEASE_DIR/server" "\$APP_DIR/server"
cp -a "\$TMP_RELEASE_DIR/web" "\$APP_DIR/web"

bash "\$APP_DIR/server/scripts/deploy-direct-linux.sh" \
  --app-dir "\$APP_DIR" \
  --server-process-name $quotedServerProcessName \
  --web-process-name $quotedWebProcessName \
  --server-health-url $quotedServerHealthUrl \
  --web-health-url $quotedWebHealthUrl

rm -rf "\$TMP_RELEASE_DIR"
rm -f "\$PACKAGE"
"@

Write-DeployLog "Running remote deploy script"
Invoke-Native -FilePath $script:SshBin -Arguments @($sshCommonArguments + $remoteTarget + $remoteDeployCommand)

Remove-IfExists -LiteralPath $archivePath
Write-DeployLog "Direct upload deployment completed successfully."
