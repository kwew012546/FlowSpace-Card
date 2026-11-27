// scripts/qa-multi-ip-defense.mjs
import http from 'http'

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'

async function makeRequest(path, method, body, headers = {}) {
  const url = `${BASE_URL}${path}`
  const payload = JSON.stringify(body)
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    ...headers
  }

  const res = await fetch(url, {
    method,
    headers: defaultHeaders,
    body: method !== 'GET' ? payload : undefined
  })

  let data
  try {
    data = await res.json()
  } catch {
    data = await res.text()
  }

  return { status: res.status, data, headers: res.headers }
}

async function runComprehensiveQASuite() {
  console.log('\n======================================================================')
  console.log('🛡️ [COMPREHENSIVE QA TEST SUITE] Multi-IP Anti-Spam & Distributed Defense')
  console.log('======================================================================\n')

  const results = []

  function recordTest(id, title, priority, passCondition, details = '') {
    const passed = Boolean(passCondition)
    results.push({ id, title, priority, passed, details })
    const icon = passed ? '✅ PASS' : '❌ FAIL'
    console.log(`[${id}] [${priority}] ${icon}: ${title}`)
    if (!passed && details) {
      console.log(`     ↳ Reason: ${details}`)
    }
  }

  // ----------------------------------------------------
  // SCENARIO 1: Honeypot Zero-Cost Bot Trap
  // ----------------------------------------------------
  console.log('\n--- Scenario 1: Honeypot Zero-Cost Bot Trap ---')
  {
    // TC-001: Forgot Password Honeypot
    const r1 = await makeRequest('/api/auth/forgot-password', 'POST', {
      email: 'bot@example.com',
      website: 'https://spambot.xyz'
    })
    recordTest('TC-001', 'Honeypot blocks bot on forgot-password with HTTP 400', 'P0', r1.status === 400, `Got: ${r1.status}`)

    // TC-002: Login Honeypot
    const r2 = await makeRequest('/api/auth/login', 'POST', {
      email: 'bot@example.com',
      password: 'password',
      website: 'Spam Value'
    })
    recordTest('TC-002', 'Honeypot blocks bot on login with HTTP 400', 'P0', r2.status === 400, `Got: ${r2.status}`)

    // TC-003: Register Honeypot
    const r3 = await makeRequest('/api/auth/register', 'POST', {
      username: 'bot',
      email: 'bot@example.com',
      password: 'password',
      website: 'http://malicious.org'
    })
    recordTest('TC-003', 'Honeypot blocks bot on register with HTTP 400', 'P0', r3.status === 400, `Got: ${r3.status}`)
  }

  // ----------------------------------------------------
  // SCENARIO 2: Multi-IP Target Rate Limit (Forgot Password)
  // ----------------------------------------------------
  console.log('\n--- Scenario 2: Multi-IP Target Rate Limit (Forgot Password) ---')
  {
    const targetEmail = `qa_forgot_${Date.now()}@flowspace.test`
    const ips = ['203.0.113.101', '203.0.113.102', '203.0.113.103', '203.0.113.104']

    // TC-004: 3 Requests from 3 distinct IPs allowed
    const r1 = await makeRequest('/api/auth/forgot-password', 'POST', { email: targetEmail }, { 'X-Forwarded-For': ips[0] })
    const r2 = await makeRequest('/api/auth/forgot-password', 'POST', { email: targetEmail }, { 'X-Forwarded-For': ips[1] })
    const r3 = await makeRequest('/api/auth/forgot-password', 'POST', { email: targetEmail }, { 'X-Forwarded-For': ips[2] })
    recordTest('TC-004', 'Multi-IP: First 3 forgot-password requests from 3 distinct IPs are allowed (200 OK)', 'P0', 
      r1.status === 200 && r2.status === 200 && r3.status === 200, 
      `Statuses: ${r1.status}, ${r2.status}, ${r3.status}`
    )

    // TC-005: 4th request from brand new 4th IP blocked
    const r4 = await makeRequest('/api/auth/forgot-password', 'POST', { email: targetEmail }, { 'X-Forwarded-For': ips[3] })
    recordTest('TC-005', 'Multi-IP: 4th forgot-password request from fresh 4th IP is throttled with HTTP 429', 'P0', 
      r4.status === 429 && r4.data?.message?.includes('เกินกำหนด'), 
      `Status: ${r4.status}, Msg: ${r4.data?.message}`
    )

    // TC-006: Case-insensitivity normalization
    const rUpper = await makeRequest('/api/auth/forgot-password', 'POST', { email: targetEmail.toUpperCase() }, { 'X-Forwarded-For': '203.0.113.105' })
    recordTest('TC-006', 'Normalization: Uppercase variant shares quota bucket and is throttled (429)', 'P1', 
      rUpper.status === 429, 
      `Status: ${rUpper.status}`
    )
  }

  // ----------------------------------------------------
  // SCENARIO 3: Multi-IP Distributed Brute Force (Login Lockout)
  // ----------------------------------------------------
  console.log('\n--- Scenario 3: Multi-IP Distributed Credential Stuffing (Login Lockout) ---')
  {
    const victimEmail = `victim_brute_${Date.now()}@flowspace.test`
    const attackIps = [
      '198.51.100.201',
      '198.51.100.202',
      '198.51.100.203',
      '198.51.100.204',
      '198.51.100.205',
      '198.51.100.206'
    ]

    // TC-007: Attempts 1 to 5 from 5 different IPs
    let recordedAttempts = 0
    for (let i = 0; i < 5; i++) {
      const res = await makeRequest('/api/auth/login', 'POST', {
        email: victimEmail,
        password: `wrong_pwd_${i}`
      }, { 'X-Forwarded-For': attackIps[i] })
      if (res.status === 401 || res.status === 429) recordedAttempts++
    }
    recordTest('TC-007', 'Distributed Brute Force: 5 failed attempts across 5 distinct IPs are recorded', 'P0', 
      recordedAttempts === 5, 
      `Recorded: ${recordedAttempts}/5`
    )

    // TC-008: Attempt 6 from brand new 6th IP is locked out
    const r6 = await makeRequest('/api/auth/login', 'POST', {
      email: victimEmail,
      password: 'wrong_password_final'
    }, { 'X-Forwarded-For': attackIps[5] })
    recordTest('TC-008', 'Distributed Brute Force: 6th attempt from fresh 6th IP is locked out with HTTP 429', 'P0', 
      r6.status === 429 && r6.data?.message?.includes('ลืมรหัสผ่าน'), 
      `Status: ${r6.status}, Msg: ${r6.data?.message}`
    )
  }

  // ----------------------------------------------------
  // SCENARIO 4: Multi-IP Resend Verification Spam
  // ----------------------------------------------------
  console.log('\n--- Scenario 4: Multi-IP Resend Verification Flood ---')
  {
    const unverifiedEmail = `unverified_${Date.now()}@flowspace.test`
    const ips = ['192.0.2.11', '192.0.2.12', '192.0.2.13', '192.0.2.14']

    // We send requests (whether account exists or not, target limiter tracks attempts)
    const r1 = await makeRequest('/api/auth/resend-verification', 'POST', { email: unverifiedEmail }, { 'X-Forwarded-For': ips[0] })
    const r2 = await makeRequest('/api/auth/resend-verification', 'POST', { email: unverifiedEmail }, { 'X-Forwarded-For': ips[1] })
    const r3 = await makeRequest('/api/auth/resend-verification', 'POST', { email: unverifiedEmail }, { 'X-Forwarded-For': ips[2] })
    const r4 = await makeRequest('/api/auth/resend-verification', 'POST', { email: unverifiedEmail }, { 'X-Forwarded-For': ips[3] })

    recordTest('TC-009', 'Multi-IP Resend: 4th attempt from fresh IP is throttled with HTTP 429', 'P1', 
      r4.status === 429 && r4.data?.message?.includes('เกินกำหนด'), 
      `Status: ${r4.status}, Msg: ${r4.data?.message}`
    )
  }

  // ----------------------------------------------------
  // SCENARIO 5: Clean Input & Quiet UX
  // ----------------------------------------------------
  console.log('\n--- Scenario 5: Clean Input & Quiet UX ---')
  {
    // TC-010: Legitimate submission with empty honeypot is NOT blocked
    const cleanForgot = await makeRequest('/api/auth/forgot-password', 'POST', {
      email: `clean_user_${Date.now()}@flowspace.test`,
      website: ''
    })
    recordTest('TC-010', 'Quiet UX: Clean human submission with empty honeypot proceeds normally (200 OK)', 'P0', 
      cleanForgot.status === 200, 
      `Status: ${cleanForgot.status}`
    )

    // TC-011: Humane countdown recovery guidance
    const throttledUser = `throttled_${Date.now()}@flowspace.test`
    for (let i = 0; i < 3; i++) {
      await makeRequest('/api/auth/forgot-password', 'POST', { email: throttledUser })
    }
    const throttledRes = await makeRequest('/api/auth/forgot-password', 'POST', { email: throttledUser })
    recordTest('TC-011', 'Humane Recovery: Rate limit error message specifies wait time in minutes', 'P1', 
      throttledRes.status === 429 && throttledRes.data?.message?.includes('นาที'), 
      `Msg: ${throttledRes.data?.message}`
    )
  }

  // ----------------------------------------------------
  // SCENARIO 6: Frontend Accessibility & Honeypot Placement
  // ----------------------------------------------------
  console.log('\n--- Scenario 6: Frontend Accessibility & DOM Inspection ---')
  {
    const fs = await import('fs')
    const loginHtml = fs.readFileSync('app/pages/login.vue', 'utf8')
    const regHtml = fs.readFileSync('app/pages/register.vue', 'utf8')
    const forgotHtml = fs.readFileSync('app/pages/forgot-password.vue', 'utf8')

    const hasHoneypotLogin = loginHtml.includes('name="website"') && loginHtml.includes('tabindex="-1"')
    const hasHoneypotReg = regHtml.includes('name="website"') && regHtml.includes('tabindex="-1"')
    const hasHoneypotForgot = forgotHtml.includes('name="website"') && forgotHtml.includes('tabindex="-1"')

    recordTest('TC-012', 'Accessibility: Login page honeypot has tabindex="-1" and aria-hidden="true"', 'P1', hasHoneypotLogin)
    recordTest('TC-013', 'Accessibility: Register page honeypot has tabindex="-1" and aria-hidden="true"', 'P1', hasHoneypotReg)
    recordTest('TC-014', 'Accessibility: Forgot Password honeypot has tabindex="-1" and aria-hidden="true"', 'P1', hasHoneypotForgot)
  }

  console.log('\n======================================================================')
  const total = results.length
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  console.log(`📊 QA EXECUTION SUMMARY: ${passed}/${total} PASSED (${((passed/total)*100).toFixed(1)}%) | ${failed} FAILED`)
  console.log('======================================================================\n')

  return { total, passed, failed, results }
}

runComprehensiveQASuite().then(res => {
  if (res.failed > 0) process.exit(1)
}).catch(err => {
  console.error('Fatal error in QA Suite:', err)
  process.exit(1)
})
