import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

type EnvMap = Record<string, string>

function readEnv(path: string): EnvMap {
  if (!existsSync(path)) return {}
  const values: EnvMap = {}
  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const index = line.indexOf('=')
    if (index < 1) continue
    const key = line.slice(0, index).trim()
    let value = line.slice(index + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    values[key] = value
  }
  return values
}

function readLegacyDatabasePassword(path: string) {
  if (!existsSync(path)) return ''
  const match = readFileSync(path, 'utf8').match(/^#?\s*database-password=(.+)$/m)
  return match?.[1]?.trim() || ''
}

function findPsql() {
  const candidates = [
    'psql',
    'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe',
    'C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe',
    'C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe',
    'D:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe',
    'D:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe',
    'D:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe'
  ]
  const found = candidates.find((candidate) => {
    if (candidate !== 'psql' && !existsSync(candidate)) return false
    const result = spawnSync(candidate, ['--version'], { windowsHide: true })
    return result.status === 0
  })
  if (!found) {
    throw new Error('psql was not found. Add PostgreSQL bin to PATH or install PostgreSQL locally.')
  }
  return found
}

function runPsql(psql: string, args: string[], password: string) {
  const result = spawnSync(psql, args, {
    env: { ...process.env, PGPASSWORD: password },
    stdio: 'inherit',
    windowsHide: true
  })

  if (result.status !== 0) {
    throw new Error(result.error?.message || `psql failed with exit code ${result.status}`)
  }
}

function sqlLiteral(value: string) {
  return `'${value.replace(/'/g, "''")}'`
}

function sqlIdentifier(value: string) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`Unsupported PostgreSQL identifier: ${value}`)
  }
  return `"${value}"`
}

function connectionParts(databaseUrl: string) {
  const url = new URL(databaseUrl)
  return {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    host: url.hostname || '127.0.0.1',
    port: url.port || '5432',
    database: url.pathname.replace(/^\//, '') || 'overwatch_workshop'
  }
}

const envPath = '.env'
const env = readEnv(envPath)
const databaseUrl = env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing in .env')
}

const app = connectionParts(databaseUrl)
const superUrl = process.env.PG_SUPER_URL
const superParts = superUrl
  ? connectionParts(superUrl)
  : {
      user: process.env.PG_SUPER_USER || 'postgres',
      password: process.env.PG_SUPER_PASSWORD || readLegacyDatabasePassword(envPath),
      host: process.env.PG_SUPER_HOST || app.host,
      port: process.env.PG_SUPER_PORT || app.port,
      database: process.env.PG_SUPER_DB || 'postgres'
    }

if (!superParts.password) {
  throw new Error('PG_SUPER_PASSWORD or PG_SUPER_URL is required to create the local database.')
}

const psql = findPsql()
const baseArgs = ['-h', superParts.host, '-p', superParts.port, '-U', superParts.user, '-d', superParts.database, '-w']
const role = sqlIdentifier(app.user)
const db = sqlIdentifier(app.database)
const roleName = sqlLiteral(app.user)
const dbName = sqlLiteral(app.database)
const appPassword = sqlLiteral(app.password)

console.log(`Initializing local database ${app.database} for user ${app.user}...`)

runPsql(
  psql,
  [
    ...baseArgs,
    '-c',
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = ${roleName}) THEN CREATE ROLE ${role} LOGIN PASSWORD ${appPassword}; ELSE ALTER ROLE ${role} WITH LOGIN PASSWORD ${appPassword}; END IF; END $$;`
  ],
  superParts.password
)

runPsql(
  psql,
  [
    ...baseArgs,
    '-tAc',
    `SELECT 'CREATE DATABASE ${app.database} OWNER ${app.user}' WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = ${dbName})`
  ],
  superParts.password
)

const createDb = spawnSync(
  psql,
  [
    ...baseArgs,
    '-tAc',
    `SELECT 'missing' WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = ${dbName})`
  ],
  { env: { ...process.env, PGPASSWORD: superParts.password }, encoding: 'utf8', windowsHide: true }
)

if (createDb.stdout.includes('missing')) {
  runPsql(psql, [...baseArgs, '-c', `CREATE DATABASE ${db} OWNER ${role}`], superParts.password)
}

runPsql(psql, ['-h', app.host, '-p', app.port, '-U', superParts.user, '-d', app.database, '-w', '-c', `GRANT ALL PRIVILEGES ON DATABASE ${db} TO ${role}`], superParts.password)

console.log('Local database is ready.')
