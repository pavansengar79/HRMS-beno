const assert = require('node:assert/strict')
const { test } = require('node:test')

const baseUrl = process.env.HRMS_BASE_URL || 'http://localhost:3001'

for (const [route, expectedStatus] of [
  ['/auth/login/', 200],
  ['/auth/register/', 200],
  ['/404/', 404]
]) {
  test(`${route} responds with HTML and status ${expectedStatus}`, async () => {
    const response = await fetch(new URL(route, baseUrl), {
      redirect: 'manual',
      signal: AbortSignal.timeout(15000)
    })

    assert.equal(response.status, expectedStatus)
    assert.match(response.headers.get('content-type') || '', /text\/html/i)
    assert.match(await response.text(), /<html[\s>]/i)
  })
}