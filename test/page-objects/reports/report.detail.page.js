import { $, browser, expect } from '@wdio/globals'

class ReportDetailPage {
  async headingText() {
    const element = await $('h1.govuk-heading-xl')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async useThisData() {
    await $('button[type=submit]').click()
  }

  async useThisDataAndCheckDoubleClickPrevented() {
    const ariaDisabled = await browser.execute((selector) => {
      const btn = document.querySelector(selector)
      btn.click()
      return btn.getAttribute('aria-disabled')
    }, 'button[type=submit]')
    expect(ariaDisabled).toBe('true')
  }
}

export default new ReportDetailPage()
