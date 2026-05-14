import { $, browser, expect } from '@wdio/globals'

class ReportCheckAnswersPage {
  async headingText() {
    const element = await $('h1.govuk-heading-xl')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async createReport() {
    await $('button[type=submit]').click()
  }

  async createReportAndCheckDoubleClickPrevented() {
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
    const currentUrl = await browser.getUrl()
    await browser.execute(() => document.querySelector('form').submit())
    await browser.waitUntil(
      async () => (await browser.getUrl()) !== currentUrl,
      {
        timeout: 10000
      }
    )
  }

  async deleteAndStartAgainLink() {
    await $('a*=Delete and start again').click()
  }
}

export default new ReportCheckAnswersPage()
