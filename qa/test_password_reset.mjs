// qa/test_password_reset.mjs
const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('🧪 Starting Password Reset Flow Automated QA Test...');

  // Step 1: Create a test user or register
  const testEmail = `pw_test_${Date.now()}@flowspace.test`;
  const initialPassword = 'initialPass123';
  const newPassword = 'newSecretPass456';

  console.log(`\n1. Registering test user: ${testEmail}`);
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      username: 'reset_tester',
      password: initialPassword
    })
  });
  const regData = await regRes.json();
  if (!regRes.ok) throw new Error('Registration failed: ' + JSON.stringify(regData));
  console.log('✅ User registered successfully');

  // Verify email using verifyUrl if returned, or directly via prisma/endpoint
  if (regData.verifyUrl) {
    const vRes = await fetch(regData.verifyUrl);
    console.log('✅ User email verified via verifyUrl, status:', vRes.status);
  }

  // Step 2: Test anti-enumeration on unknown email
  console.log('\n2. Testing anti-enumeration on non-existent email...');
  const anonRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nonexistent_ghost_99999@test.com' })
  });
  const anonData = await anonRes.json();
  if (anonRes.status !== 200 || !anonData.success) {
    throw new Error('Anti-enumeration check failed: ' + JSON.stringify(anonData));
  }
  console.log('✅ Anti-enumeration check passed (returns 200 success without leaking existence)');

  // Step 3: Request forgot-password for test user
  console.log('\n3. Requesting forgot password for test user...');
  const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail })
  });
  const forgotData = await forgotRes.json();
  if (!forgotRes.ok || !forgotData.success || !forgotData.resetUrl) {
    throw new Error('Forgot password request failed: ' + JSON.stringify(forgotData));
  }
  console.log('✅ Forgot password link generated:', forgotData.resetUrl);

  const urlObj = new URL(forgotData.resetUrl);
  const token = urlObj.searchParams.get('token');
  if (!token) throw new Error('No token found in resetUrl');

  // Step 4: Verify reset token
  console.log('\n4. Verifying reset token via GET /api/auth/verify-reset-token...');
  const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
  const verifyData = await verifyRes.json();
  if (!verifyRes.ok || !verifyData.valid || verifyData.email !== testEmail) {
    throw new Error('Verify reset token failed: ' + JSON.stringify(verifyData));
  }
  console.log('✅ Token validated successfully for email:', verifyData.email);

  // Step 5: Boundary check - password too short (< 6 chars)
  console.log('\n5. Boundary test: reset password with < 6 chars...');
  const shortRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword: '123' })
  });
  if (shortRes.status !== 400) {
    throw new Error('Expected 400 for short password, got: ' + shortRes.status);
  }
  console.log('✅ Boundary check passed: short password rejected with 400');

  // Step 6: Reset password with valid new password
  console.log('\n6. Resetting password with valid new password...');
  const resetSuccessRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  const resetSuccessData = await resetSuccessRes.json();
  if (!resetSuccessRes.ok || !resetSuccessData.success) {
    throw new Error('Reset password failed: ' + JSON.stringify(resetSuccessData));
  }
  console.log('✅ Password successfully reset:', resetSuccessData.message);

  // Step 7: Anti-Replay test - trying to reuse the same token
  console.log('\n7. Anti-Replay check: trying to reuse the spent token...');
  const replayRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword: 'anotherPass789' })
  });
  if (replayRes.status !== 400) {
    throw new Error('Anti-replay failed: expected 400, got: ' + replayRes.status);
  }
  console.log('✅ Anti-replay check passed: spent token rejected with 400');

  // Step 8: Verify old password fails login
  console.log('\n8. Verifying login with OLD password fails...');
  const oldLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: initialPassword })
  });
  if (oldLoginRes.status !== 401) {
    throw new Error('Old password login should fail with 401, got: ' + oldLoginRes.status);
  }
  console.log('✅ Old password rejected with 401 Unauthorized');

  // Step 9: Verify NEW password succeeds login
  console.log('\n9. Verifying login with NEW password succeeds...');
  const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: newPassword })
  });
  const newLoginData = await newLoginRes.json();
  if (!newLoginRes.ok || !newLoginData.user) {
    throw new Error('New password login failed: ' + JSON.stringify(newLoginData));
  }
  console.log('✅ New password login SUCCEEDED! User:', newLoginData.user.username);

  console.log('\n🎉 ALL 9 PASSWORD RESET CHECKS PASSED 100%! 🎉\n');
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
