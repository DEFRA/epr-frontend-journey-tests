import { $, browser, expect } from '@wdio/globals'

class ConfirmCancelPRNPage {
  async headingText() {
    const element = await $('h1.govuk-heading-xl')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async confirmCancelAndCheckDoubleClickPrevented() {
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

  async confirmCancelPrn() {
    await $('button[type=submit]').click()
  }

  async selectBackLink() {
    await $('a*=Back').click()
  }
}

export default new ConfirmCancelPRNPage()
