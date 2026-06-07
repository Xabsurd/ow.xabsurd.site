import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import path from 'node:path'

const root = process.cwd()
const catalogPath = path.join(root, 'app/utils/catalog.ts')
const outputDir = path.join(root, 'public/maps')
const tempDir = path.join(root, '.nuxt-local-logs/map-images')

const catalog = await readFile(catalogPath, 'utf8')
const mapPattern = /\{\s*name:\s*'([^']+)',\s*slug:\s*'([^']+)',\s*mode:\s*'([^']+)',\s*image:\s*'([^']+)'\s*\}/g
const maps = [...catalog.matchAll(mapPattern)].map((match) => ({
  name: match[1],
  slug: match[2],
  mode: match[3],
  image: match[4]
}))

if (!maps.length) {
  throw new Error('No maps found in app/utils/catalog.ts')
}

await mkdir(outputDir, { recursive: true })
await mkdir(tempDir, { recursive: true })

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'pipe' })
    let stderr = ''
    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${command} ${args.join(' ')} failed with ${code}\n${stderr}`))
    })
  })
}

async function download(url, target) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; OW Workshop Hub image cache)'
    }
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  const bytes = Buffer.from(await response.arrayBuffer())
  await writeFile(target, bytes)
  return bytes.length
}

const results = []

for (const map of maps) {
  const localPath = `/maps/${map.slug}.webp`
  const outputPath = path.join(outputDir, `${map.slug}.webp`)

  if (existsSync(outputPath)) {
    results.push({ ...map, localPath, status: 'kept' })
    continue
  }

  const tempPath = path.join(tempDir, `${map.slug}.source`)
  try {
    const sourceSize = await download(map.image, tempPath)
    await run('ffmpeg', [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      tempPath,
      '-vf',
      'scale=960:-2',
      '-c:v',
      'libwebp',
      '-quality',
      '76',
      '-compression_level',
      '6',
      outputPath
    ])
    results.push({ ...map, localPath, sourceSize, status: 'created' })
  } catch (error) {
    results.push({ ...map, localPath, status: 'failed', error: error.message })
  } finally {
    await rm(tempPath, { force: true })
  }
}

const failed = results.filter((item) => item.status === 'failed')
const created = results.filter((item) => item.status === 'created').length
const kept = results.filter((item) => item.status === 'kept').length

console.log(`Map images: ${created} created, ${kept} kept, ${failed.length} failed.`)
if (failed.length) {
  for (const item of failed) {
    console.log(`- ${item.slug}: ${item.error}`)
  }
  process.exitCode = 1
}
