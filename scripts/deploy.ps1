param(
  [string]$DeployEnvPath = ".env.deploy",
  [string]$LocalSecretsPath = ".env",
  [switch]$SkipBuild,
  [switch]$SkipCreateDatabase,
  [switch]$SkipMigrate,
  [switch]$SkipPm2Install
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Read-EnvFile {
  param([string]$Path)

  $values = @{}
  if (-not (Test-Path -LiteralPath $Path)) {
    return $values
  }

  foreach ($line in Get-Content -LiteralPath $Path) {
    $trimmed = $line.Trim()
    if ($trimmed.Length -eq 0 -or $trimmed.StartsWith("#")) {
      continue
    }

    $index = $trimmed.IndexOf("=")
    if ($index -lt 1) {
      continue
    }

    $key = $trimmed.Substring(0, $index).Trim()
    $value = $trimmed.Substring($index + 1).Trim()
    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    $values[$key] = $value
  }

  return $values
}

function Require-Env {
  param(
    [hashtable]$Values,
    [string]$Key
  )

  if (-not $Values.ContainsKey($Key) -or [string]::IsNullOrWhiteSpace([string]$Values[$Key])) {
    throw "Missing required deploy setting: $Key"
  }

  return [string]$Values[$Key]
}

function Quote-Shell {
  param([string]$Value)
  return "'" + $Value.Replace("'", "'\''") + "'"
}

function Quote-SqlLiteral {
  param([string]$Value)
  return "'" + $Value.Replace("'", "''") + "'"
}

function Quote-PgIdentifier {
  param([string]$Value)
  if ($Value -notmatch '^[A-Za-z_][A-Za-z0-9_]*$') {
    throw "PostgreSQL identifier '$Value' is not supported by this deploy script. Use letters, numbers, and underscores, and do not start with a number."
  }
  return '"' + $Value.Replace('"', '""') + '"'
}

function New-SessionSecret {
  $bytes = New-Object byte[] 48
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $rng.GetBytes($bytes)
  }
  finally {
    $rng.Dispose()
  }
  return [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function Write-RemoteEnv {
  param(
    [string]$Path,
    [hashtable]$Values
  )

  $lines = New-Object System.Collections.Generic.List[string]
  foreach ($key in $Values.Keys | Sort-Object) {
    $value = [string]$Values[$key]
    $escaped = $value.Replace("\", "\\").Replace('"', '\"')
    $lines.Add("$key=`"$escaped`"")
  }

  Set-Content -LiteralPath $Path -Value $lines -Encoding UTF8
}

function Invoke-Checked {
  param(
    [string]$File,
    [string[]]$Arguments
  )

  & $File @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$File failed with exit code $LASTEXITCODE"
  }
}

$deploy = Read-EnvFile -Path $DeployEnvPath
$localSecrets = Read-EnvFile -Path $LocalSecretsPath

$hostName = Require-Env -Values $deploy -Key "DEPLOY_HOST"
$userName = Require-Env -Values $deploy -Key "DEPLOY_USER"
$port = if ($deploy.ContainsKey("DEPLOY_PORT")) { [string]$deploy["DEPLOY_PORT"] } else { "22" }
$deployPath = Require-Env -Values $deploy -Key "DEPLOY_PATH"
$appName = Require-Env -Values $deploy -Key "DEPLOY_APP_NAME"
$adminPassword = Require-Env -Values $deploy -Key "SITE_PASSWORD"
$sessionSecret = if ($deploy.ContainsKey("SESSION_SECRET")) {
  [string]$deploy["SESSION_SECRET"]
}
elseif ($deploy.ContainsKey("DEPLOY_SESSION_SECRET")) {
  [string]$deploy["DEPLOY_SESSION_SECRET"]
}
else {
  New-SessionSecret
}

$dbHost = if ($deploy.ContainsKey("DB_HOST")) { [string]$deploy["DB_HOST"] } else { "127.0.0.1" }
$dbPort = if ($deploy.ContainsKey("DB_PORT")) { [string]$deploy["DB_PORT"] } else { "5432" }
$dbName = if ($deploy.ContainsKey("DB_NAME")) { [string]$deploy["DB_NAME"] } else { "overwatch_workshop" }
$dbUser = if ($deploy.ContainsKey("DB_USER")) { [string]$deploy["DB_USER"] } else { "overwatch_workshop" }
$dbPassword = Require-Env -Values $deploy -Key "DB_PASSWORD"
$databaseUrl = "postgresql://$([uri]::EscapeDataString($dbUser)):$([uri]::EscapeDataString($dbPassword))@$dbHost`:$dbPort/$dbName"
$appPort = if ($deploy.ContainsKey("APP_PORT")) { [string]$deploy["APP_PORT"] } else { "3001" }
$initialAdminEmail = if ($deploy.ContainsKey("INITIAL_ADMIN_EMAIL")) { [string]$deploy["INITIAL_ADMIN_EMAIL"] } else { "admin@example.com" }

$sshTarget = "$userName@$hostName"
$sshArgs = @("-p", $port)
$scpArgs = @("-P", $port)
if ($deploy.ContainsKey("DEPLOY_SSH_KEY") -and -not [string]::IsNullOrWhiteSpace([string]$deploy["DEPLOY_SSH_KEY"])) {
  $sshArgs += @("-i", [string]$deploy["DEPLOY_SSH_KEY"])
  $scpArgs += @("-i", [string]$deploy["DEPLOY_SSH_KEY"])
}

$buildCommand = if ($deploy.ContainsKey("DEPLOY_BUILD_COMMAND")) { [string]$deploy["DEPLOY_BUILD_COMMAND"] } else { "npm run build" }
if (-not $SkipBuild) {
  Write-Host "Building application..."
  Invoke-Expression $buildCommand
  if ($LASTEXITCODE -ne 0) {
    throw "Build failed with exit code $LASTEXITCODE"
  }
}

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) "ow-deploy-$timestamp"
$bundlePath = Join-Path $tempRoot "app.tgz"
$remoteTmp = "/tmp/$appName-$timestamp.tgz"
$releasePath = "$deployPath/releases/$timestamp"
$remoteEnvPath = Join-Path $tempRoot ".env.production"

New-Item -ItemType Directory -Path $tempRoot | Out-Null

try {
  Write-Host "Creating deployment bundle..."
  Invoke-Checked -File "tar" -Arguments @(
    "-czf",
    $bundlePath,
    ".output",
    "package.json",
    "package-lock.json",
    "prisma"
  )

  $publicSiteUrl = if ($deploy.ContainsKey("PUBLIC_BASE_URL")) { [string]$deploy["PUBLIC_BASE_URL"] } else { "http://$hostName" }

  $remoteEnv = @{
    DATABASE_URL = $databaseUrl
    INITIAL_ADMIN_EMAIL = $initialAdminEmail
    INITIAL_ADMIN_PASSWORD = $adminPassword
    SESSION_SECRET = $sessionSecret
    PORT = $appPort
    NUXT_PUBLIC_SITE_URL = $publicSiteUrl
  }

  foreach ($key in @("SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM")) {
    if ($deploy.ContainsKey($key) -and -not [string]::IsNullOrWhiteSpace([string]$deploy[$key])) {
      $remoteEnv[$key] = [string]$deploy[$key]
    }
  }

  Write-RemoteEnv -Path $remoteEnvPath -Values $remoteEnv

  Write-Host "Preparing remote directories..."
  $quotedDeployPath = Quote-Shell $deployPath
  $quotedReleasePath = Quote-Shell $releasePath
  Invoke-Checked -File "ssh" -Arguments ($sshArgs + @($sshTarget, "mkdir -p $quotedDeployPath/releases $quotedDeployPath/shared $quotedReleasePath"))

  Write-Host "Uploading bundle and environment..."
  Invoke-Checked -File "scp" -Arguments ($scpArgs + @($bundlePath, "$sshTarget`:$remoteTmp"))
  Invoke-Checked -File "scp" -Arguments ($scpArgs + @($remoteEnvPath, "$sshTarget`:$deployPath/shared/.env"))

  $commands = New-Object System.Collections.Generic.List[string]
  $commands.Add("set -e")
  $commands.Add("tar -xzf $(Quote-Shell $remoteTmp) -C $(Quote-Shell $releasePath)")
  $commands.Add("cd $(Quote-Shell $releasePath)")
  $commands.Add("npm ci --ignore-scripts")
  $commands.Add("npx prisma generate")
  if (-not $SkipCreateDatabase) {
    $roleLiteral = Quote-SqlLiteral $dbUser
    $dbLiteral = Quote-SqlLiteral $dbName
    $passwordLiteral = Quote-SqlLiteral $dbPassword
    $roleIdentifier = Quote-PgIdentifier $dbUser
    $dbIdentifier = Quote-PgIdentifier $dbName
    $roleExistsSql = Quote-Shell "SELECT 1 FROM pg_roles WHERE rolname = $roleLiteral"
    $dbExistsSql = Quote-Shell "SELECT 1 FROM pg_database WHERE datname = $dbLiteral"
    $createRoleSql = Quote-Shell "CREATE USER $roleIdentifier WITH PASSWORD $passwordLiteral"
    $alterRoleSql = Quote-Shell "ALTER USER $roleIdentifier WITH PASSWORD $passwordLiteral"
    $commands.Add("if ! sudo -u postgres psql -tAc $roleExistsSql | grep -q 1; then sudo -u postgres psql -c $createRoleSql; fi")
    $commands.Add("if ! sudo -u postgres psql -tAc $dbExistsSql | grep -q 1; then sudo -u postgres createdb -O $dbIdentifier $dbIdentifier; fi")
    $commands.Add("sudo -u postgres psql -c $alterRoleSql")
  }
  if (-not $SkipMigrate) {
    $commands.Add("set -a")
    $commands.Add(". $(Quote-Shell "$deployPath/shared/.env")")
    $commands.Add("set +a")
    $commands.Add("npx prisma migrate deploy")
    $commands.Add("npm run db:seed:prod")
  }
  $commands.Add("ln -sfn $(Quote-Shell $releasePath) $(Quote-Shell "$deployPath/current")")
  if (-not $SkipPm2Install) {
    $commands.Add("command -v pm2 >/dev/null 2>&1 || npm install -g pm2")
  }
  $commands.Add("cd $(Quote-Shell "$deployPath/current")")
  $commands.Add("set -a")
  $commands.Add(". $(Quote-Shell "$deployPath/shared/.env")")
  $commands.Add("set +a")
  $commands.Add("pm2 describe $(Quote-Shell $appName) >/dev/null 2>&1 && pm2 reload $(Quote-Shell $appName) --update-env || pm2 start .output/server/index.mjs --name $(Quote-Shell $appName)")
  $commands.Add("pm2 save")
  $commands.Add("rm -f $(Quote-Shell $remoteTmp)")

  Write-Host "Deploying on remote server..."
  Invoke-Checked -File "ssh" -Arguments ($sshArgs + @($sshTarget, ($commands -join " && ")))

  Write-Host "Deployment complete: $appName -> ${sshTarget}:$deployPath"
}
finally {
  if (Test-Path -LiteralPath $tempRoot) {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force
  }
}
