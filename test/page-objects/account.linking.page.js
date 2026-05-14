import { $, browser, expect } from '@wdio/globals'

class AccountLinkingPage {
  async selectOrganisation() {
    await $('#organisation-id').click()
  }

  async confirmLinkAndCheckDoubleClickPrevented() {
    const btn = $('button[type=submit]')
    await btn.waitForClickable({ timeout: 5000 })
    await browser.execute(() => {
      window.__submitCount = 0
      document.querySelector('form').addEventListener('submit', (e) => {
        window.__submitCount++
        e.preventDefault()
      })
    })
    await btn.click()
    await btn.click()
    expect(await browser.execute(() => window.__submitCount)).toBe(1)
    await browser.execute(() => document.querySelector('form').submit())
  }
}

export default new AccountLinkingPage()
