const assert = require('node:assert/strict')
const { test } = require('node:test')

const baseUrl = process.env.HRMS_BASE_URL || 'http://localhost:3001'

function checkPage(route, expectedStatus = 200) {
  test(`${route} serves an HTML page with status ${expectedStatus}`, async () => {
    const response = await fetch(new URL(route, baseUrl), {
      redirect: 'manual',
      signal: AbortSignal.timeout(15000)
    })

    assert.equal(response.status, expectedStatus)
    assert.match(response.headers.get('content-type') || '', /text\/html/i)
    assert.match(await response.text(), /<html[\s>]/i)
  })
}

module.exports = { checkPage }