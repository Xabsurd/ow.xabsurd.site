import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

type EnvMap = Record<string, string>

type CliOptions = {
  deployEnvPath: string
  localSecretsPath: string
  skipBuild: boolean
  skipCreateDatabase: boolean
  skipMigrate: boolean
  skipPm2Install: boolean
  dryRun: boolean
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    deployEnvPath: '.env.deploy',
    localSecretsPath: '.env',
    skipBuild: false,
    skipCreateDatabase: false,
    skipMigrate: false,
    skipPm2Install: false,
    dryRun: false
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = argv[i + 1]

    if (arg === '--env' && next) {
      options.deployEnvPath = next
      i += 1
    } else if (arg === '--local-secrets' && next) {
      options.localSecretsPath = next
      i += 1
    } else if (arg === '--skip-build') {
      options.skipBuild = true
    } else if (arg === '--skip-create-database') {
      options.skipCreateDatabase = true
    } else if (arg === '--skip-migrate') {
      options.skipMigrate = true
    } else if (arg === '--skip-pm2-install') {
      options.skipPm2Install = true
    } else if (arg === '--dry-run') {
      options.dryRun = true
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else {
      throw new Error(`Unknown deploy argument: ${arg}`)
    }
  }

  return options
}

function printHelp() {
  console.log(`Usage: npm run deploy -- [options]

Options:
  --env <path>              Deploy env file. Default: .env.deploy
  --local-secrets <path>    Local secrets file. Default: .env
  --skip-build              Do not run local build before packaging
  --skip-create-database    Do not create PostgreSQL role/database on remote
  --skip-migrate            Do not run Prisma migrate and admin seed
  --skip-pm2-install        Do not install PM2 if missing
  --dry-run                 Validate config and print non-secret plan only

Environment:
  DEPLOY_BUILD_COMMAND      Local build command. Default: npm run build
  DEPLOY_INSTALL_COMMAND    Remote install command. Default: npm install --ignore-scripts
`)
}

async function readEnvFile(path: string): Promise<EnvMap> {
  if (!existsSync(path)) return {}

  const content = await readFile(path, 'utf8')
  const values: EnvMap = {}

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const index = line.indexOf('=')
    if (index < 1) continue

    const key = line.slice(0, index).trim()
    let value = line.slice(index + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    values[key] = value
  }

  return values
}

function requireEnv(values: EnvMap, key: string): string {
  const value = values[key]
  if (!value || !value.trim()) {
    throw new Error(`Missing required deploy setting: ${key}`)
  }
  return value
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`
}

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, `''`)}'`
}

function pgIdentifier(value: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(
      `PostgreSQL identifier "${value}" is not supported. Use letters, numbers, and underscores, and do not start with a number.`
    )
  }
  return `"${value.replace(/"/g, '""')}"`
}

function sessionSecret(): string {
  return randomBytes(48).toString('base64url')
}

function databaseUrl(user: string, password: string, host: string, port: string, db: string): string {
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${db}`
}

function remoteEnvText(values: EnvMap): string {
  return Object.keys(values)
    .sort()
    .map((key) => {
      const escaped = values[key].replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      return `${key}="${escaped}"`
    })
    .join('\n')
}

function redactText(value: string, secrets: string[] = []) {
  return secrets.reduce((text, secret) => {
    if (!secret) return text
    return text.replaceAll(secret, '***')
  }, value)
}

function run(
  file: string,
  args: string[],
  options: { shell?: boolean; dryRun?: boolean; redact?: string[] } = {}
) {
  const commandText = options.shell ? `${file} ${args.join(' ')}` : [file, ...args].join(' ')
  if (options.dryRun) {
    console.log(`[dry-run] ${redactText(commandText, options.redact)}`)
    return Promise.resolve()
  }

  return new Promise<void>((resolve, reject) => {
    const child = spawn(file, args, {
      stdio: 'inherit',
      shell: options.shell ?? false,
      windowsHide: true
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${file} failed with exit code ${code}`))
    })
  })
}

function sshArgs(port: string, key?: string) {
  const args = ['-p', port]
  if (key) args.push('-i', key)
  return args
}

function scpArgs(port: string, key?: string) {
  const args = ['-P', port]
  if (key) args.push('-i', key)
  return args
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const deploy = await readEnvFile(options.deployEnvPath)
  const localSecrets = await readEnvFile(options.localSecretsPath)

  const setting = (key: string) => deploy[key] || localSecrets[key]

  const host = requireEnv(deploy, 'DEPLOY_HOST')
  const user = requireEnv(deploy, 'DEPLOY_USER')
  const port = deploy.DEPLOY_PORT || '22'
  const deployPath = requireEnv(deploy, 'DEPLOY_PATH')
  const appName = requireEnv(deploy, 'DEPLOY_APP_NAME')
  const adminPassword = requireEnv(deploy, 'SITE_PASSWORD')
  const dbHost = deploy.DB_HOST || '127.0.0.1'
  const dbPort = deploy.DB_PORT || '5432'
  const dbName = deploy.DB_NAME || 'overwatch_workshop'
  const dbUser = deploy.DB_USER || 'overwatch_workshop'
  const dbPassword = requireEnv(deploy, 'DB_PASSWORD')
  const appPort = deploy.APP_PORT || '3001'
  const initialAdminEmail = deploy.INITIAL_ADMIN_EMAIL || 'admin@example.com'
  const publicSiteUrl = deploy.PUBLIC_BASE_URL || `http://${host}`
  const secret = setting('SESSION_SECRET') || deploy.DEPLOY_SESSION_SECRET || sessionSecret()
  const key = deploy.DEPLOY_SSH_KEY?.trim() || undefined
  const target = `${user}@${host}`
  const buildCommand = deploy.DEPLOY_BUILD_COMMAND || 'npm run build'
  const installCommand = deploy.DEPLOY_INSTALL_COMMAND || 'npm install --ignore-scripts'
  const secretsForLogs = [adminPassword, dbPassword, secret, setting('SMTP_PASS') || '']

  console.log(`Deploy target: ${target}:${deployPath}`)
  console.log(`App: ${appName}, port ${appPort}`)
  console.log(`Database: ${dbUser}@${dbHost}:${dbPort}/${dbName}`)
  console.log(`Admin email: ${initialAdminEmail}`)
  if (options.dryRun) console.log('Dry run enabled; secrets and files will not be uploaded.')

  if (!options.skipBuild) {
    console.log('Building application...')
    await run(buildCommand, [], { shell: true, dryRun: options.dryRun })
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14)
  const tempRoot = mkdtempSync(join(tmpdir(), `ow-deploy-${timestamp}-`))
  const bundlePath = join(tempRoot, 'app.tgz')
  const envPath = join(tempRoot, '.env.production')
  const remoteTmp = `/tmp/${appName}-${timestamp}.tgz`
  const releasePath = `${deployPath}/releases/${timestamp}`

  try {
    const remoteEnv: EnvMap = {
      DATABASE_URL: databaseUrl(dbUser, dbPassword, dbHost, dbPort, dbName),
      HOST: '0.0.0.0',
      INITIAL_ADMIN_EMAIL: initialAdminEmail,
      INITIAL_ADMIN_PASSWORD: adminPassword,
      NITRO_HOST: '0.0.0.0',
      NITRO_PORT: appPort,
      NODE_ENV: 'production',
      NUXT_PUBLIC_SITE_URL: publicSiteUrl,
      PORT: appPort,
      SESSION_SECRET: secret
    }

    for (const keyName of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM']) {
      const value = setting(keyName)
      if (value) remoteEnv[keyName] = value
    }

    if (!options.dryRun) {
      writeFileSync(envPath, remoteEnvText(remoteEnv), 'utf8')
    }

    console.log('Creating deployment bundle...')
    await run(
      'tar',
      [
        '-czf',
        bundlePath,
        '.output',
        'package.json',
        'package-lock.json',
        'prisma',
        'prisma.config.ts',
        'public',
        'scripts'
      ],
      { dryRun: options.dryRun }
    )

    const baseSshArgs = sshArgs(port, key)
    const baseScpArgs = scpArgs(port, key)

    console.log('Preparing remote directories...')
    await run(
      'ssh',
      [
        ...baseSshArgs,
        target,
        `mkdir -p ${shellQuote(`${deployPath}/releases`)} ${shellQuote(`${deployPath}/shared`)} ${shellQuote(releasePath)}`
      ],
      { dryRun: options.dryRun, redact: secretsForLogs }
    )

    console.log('Uploading bundle and environment...')
    await run('scp', [...baseScpArgs, bundlePath, `${target}:${remoteTmp}`], {
      dryRun: options.dryRun
    })
    await run('scp', [...baseScpArgs, envPath, `${target}:${deployPath}/shared/.env`], {
      dryRun: options.dryRun
    })

    const commands: string[] = [
      'set -euo pipefail',
      `tar -xzf ${shellQuote(remoteTmp)} -C ${shellQuote(releasePath)}`,
      `cd ${shellQuote(releasePath)}`,
      installCommand,
      'set -a',
      `. ${shellQuote(`${deployPath}/shared/.env`)}`,
      'set +a',
      'npx prisma generate'
    ]

    if (!options.skipCreateDatabase) {
      const roleLiteral = sqlLiteral(dbUser)
      const dbLiteral = sqlLiteral(dbName)
      const passwordLiteral = sqlLiteral(dbPassword)
      const roleIdentifier = pgIdentifier(dbUser)
      const dbIdentifier = pgIdentifier(dbName)
      const roleExistsSql = shellQuote(`SELECT 1 FROM pg_roles WHERE rolname = ${roleLiteral}`)
      const dbExistsSql = shellQuote(`SELECT 1 FROM pg_database WHERE datname = ${dbLiteral}`)
      const createRoleSql = shellQuote(`CREATE USER ${roleIdentifier} WITH PASSWORD ${passwordLiteral}`)
      const alterRoleSql = shellQuote(`ALTER USER ${roleIdentifier} WITH PASSWORD ${passwordLiteral}`)

      commands.push(
        `if ! sudo -u postgres psql -tAc ${roleExistsSql} | grep -q 1; then sudo -u postgres psql -c ${createRoleSql}; fi`,
        `if ! sudo -u postgres psql -tAc ${dbExistsSql} | grep -q 1; then sudo -u postgres createdb -O ${dbIdentifier} ${dbIdentifier}; fi`,
        `sudo -u postgres psql -c ${alterRoleSql}`
      )
    }

    if (!options.skipMigrate) {
      commands.push(
        'npx prisma migrate deploy',
        'npm run db:seed:prod'
      )
    }

    commands.push(`ln -sfn ${shellQuote(releasePath)} ${shellQuote(`${deployPath}/current`)}`)

    if (!options.skipPm2Install) {
      commands.push('command -v pm2 >/dev/null 2>&1 || npm install -g pm2')
    }

    commands.push(
      `cd ${shellQuote(`${deployPath}/current`)}`,
      'set -a',
      `. ${shellQuote(`${deployPath}/shared/.env`)}`,
      'set +a',
      `pm2 delete ${shellQuote(appName)} >/dev/null 2>&1 || true`,
      `pm2 start .output/server/index.mjs --name ${shellQuote(appName)} --cwd ${shellQuote(`${deployPath}/current`)} --update-env`,
      'pm2 save',
      `pm2 describe ${shellQuote(appName)}`,
      `ss -lntp | grep -E ${shellQuote(`node|:${appPort}`)} || true`,
      `rm -f ${shellQuote(remoteTmp)}`
    )

    console.log('Deploying on remote server...')
    await run('ssh', [...baseSshArgs, target, `bash -lc ${shellQuote(commands.join('\n'))}`], {
      dryRun: options.dryRun,
      redact: secretsForLogs
    })

    console.log(`Deployment complete: ${appName} -> ${target}:${deployPath}`)
  } finally {
    rmSync(tempRoot, { recursive: true, force: true })
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
