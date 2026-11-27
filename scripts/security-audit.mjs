// scripts/security-audit.mjs
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('=====================================================')
console.log('🔍 FlowSpace Full Security & Credential Leak Audit')
console.log('=====================================================\n')

const report = {
  gitLeaks: [],
  codebaseSecrets: [],
  authorizationGaps: [],
  securityHygiene: []
}

// -------------------------------------------------------------------
// 1. GIT HISTORY CREDENTIAL LEAK SCAN
// -------------------------------------------------------------------
console.log('Step 1: Auditing Git History across all commits and branches...')
try {
  const gitLog = execSync('git log -p --all', { maxBuffer: 150 * 1024 * 1024 }).toString()
  console.log(`  Scanned git diff buffer: ${(gitLog.length / 1024 / 1024).toFixed(2)} MB`)

  const regexes = [
    { name: 'Postgres / Neon DB URL with password', regex: /postgres(?:ql)?:\/\/[a-zA-Z0-9_\-\.]+:[^@\s\n\r"']+@[a-zA-Z0-9_\-\.]+/gi },
    { name: 'Upstash Redis Token', regex: /(?:UPSTASH_REDIS_REST_TOKEN|upstash_token)[^\n\r=:]*[=:]\s*["']?([a-zA-Z0-9_-]{25,})["']?/gi },
    { name: 'R2 / AWS Secret Access Key', regex: /(?:R2_SECRET_ACCESS_KEY|AWS_SECRET_ACCESS_KEY|CLOUDFLARE_API_KEY)[^\n\r=:]*[=:]\s*["']?([a-zA-Z0-9_+\/=-]{25,})["']?/gi },
    { name: 'JWT Secret Key', regex: /(?:JWT_SECRET)[^\n\r=:]*[=:]\s*["']([^"'\n\r]{16,})["']/gi },
    { name: 'Gmail SMTP App Password', regex: /(?:SMTP_PASS|EMAIL_PASS)[^\n\r=:]*[=:]\s*["']?([a-zA-Z0-9]{16})["']?/gi },
    { name: 'Private Key block', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/gi }
  ]

  const lines = gitLog.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.startsWith('+') || line.startsWith('+++')) continue
    const cleanLine = line.substring(1).trim()

    for (const rule of regexes) {
      if (rule.regex.test(cleanLine)) {
        // filter dummy examples
        if (
          cleanLine.includes('your-') ||
          cleanLine.includes('example') ||
          cleanLine.includes('dummy') ||
          cleanLine.includes('username:password') ||
          cleanLine.includes('replace-with-')
        ) {
          continue
        }

        // Trace commit hash
        let commitHash = 'unknown'
        for (let j = i; j >= 0; j--) {
          if (lines[j].startsWith('commit ')) {
            commitHash = lines[j].split(' ')[1]
            break
          }
        }

        report.gitLeaks.push({
          type: rule.name,
          commit: commitHash.substring(0, 8),
          sample: cleanLine.substring(0, 60) + '...'
        })
      }
    }
  }

  if (report.gitLeaks.length === 0) {
    console.log('  ✅ No secrets detected in Git commit history!')
  } else {
    console.log(`  ⚠️ Detected ${report.gitLeaks.length} potential secrets in Git history!`)
    report.gitLeaks.forEach(l => console.log(`    - [${l.commit}] ${l.type}: ${l.sample}`))
  }
} catch (e) {
  console.error('Git log audit error:', e.message)
}

// -------------------------------------------------------------------
// 2. CODEBASE AUDIT (SERVER API ENDPOINTS & UTILS)
// -------------------------------------------------------------------
console.log('\nStep 2: Auditing Server API Routes for Access Control (BOLA / IDOR)...')

function walkDir(dir) {
  let files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(walkDir(fullPath))
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
      files.push(fullPath)
    }
  }
  return files
}

const serverFiles = walkDir('server')
console.log(`  Found ${serverFiles.length} server files to inspect.`)

for (const file of serverFiles) {
  const content = fs.readFileSync(file, 'utf8')
  const relPath = path.relative('.', file).replace(/\\/g, '/')

  // 2.1 Check for hardcoded secrets
  if (content.includes('process.env.JWT_SECRET ||') && (content.includes("'secret'") || content.includes("'dev'"))) {
    report.codebaseSecrets.push({
      file: relPath,
      issue: 'Weak fallback for JWT_SECRET detected'
    })
  }

  // 2.2 Check API routes for authorization checks
  if (relPath.startsWith('server/api/') && !relPath.startsWith('server/api/auth/')) {
    const isPublic = relPath.includes('check-verified') || relPath.includes('verify-reset-token')
    if (!isPublic) {
      const hasAuth = 
        content.includes('getUserFromEvent') || 
        content.includes('requireAdmin') || 
        content.includes('verify') ||
        content.includes('jwt') ||
        content.includes('permissions') ||
        content.includes('checkProjectPermission') ||
        content.includes('prisma.projectMember')

      if (!hasAuth) {
        report.authorizationGaps.push({
          file: relPath,
          issue: 'Missing apparent authentication/authorization check'
        })
      }
    }
  }

  // 2.3 Check for raw queries
  if (content.includes('$queryRawUnsafe') || content.includes('$executeRawUnsafe')) {
    report.securityHygiene.push({
      file: relPath,
      issue: 'Unsafe raw SQL query detected'
    })
  }
}

// -------------------------------------------------------------------
// 3. RUNTIMECONFIG & FRONTEND EXPOSURE CHECK
// -------------------------------------------------------------------
console.log('\nStep 3: Auditing Frontend / RuntimeConfig Exposure...')
const nuxtConfig = fs.readFileSync('nuxt.config.ts', 'utf8')
if (nuxtConfig.includes('runtimeConfig')) {
  console.log('  Checking runtimeConfig...')
  if (nuxtConfig.includes('public: {') && (nuxtConfig.includes('SECRET') || nuxtConfig.includes('KEY') || nuxtConfig.includes('PASSWORD') || nuxtConfig.includes('TOKEN'))) {
    report.securityHygiene.push({
      file: 'nuxt.config.ts',
      issue: 'Potential secret exposed in runtimeConfig.public'
    })
  }
} else {
  console.log('  ✅ No secrets exposed in runtimeConfig.public in nuxt.config.ts')
}

// -------------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------------
console.log('\n=====================================================')
console.log('📊 AUDIT SUMMARY')
console.log('=====================================================')
console.log(`Git Leaks: ${report.gitLeaks.length}`)
console.log(`Codebase Hardcoded Fallbacks: ${report.codebaseSecrets.length}`)
console.log(`Potential Authorization Gaps: ${report.authorizationGaps.length}`)
console.log(`Security Hygiene Alerts: ${report.securityHygiene.length}`)

fs.writeFileSync('scripts/security-audit-report.json', JSON.stringify(report, null, 2))
console.log('\nFull JSON written to scripts/security-audit-report.json')
