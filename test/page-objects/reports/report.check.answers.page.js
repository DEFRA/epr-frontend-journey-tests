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
    const ariaDisabled = await browser.execute((selector) => {
      const btn = document.querySelector(selector)
      btn.click()
      return btn.getAttribute('aria-disabled')
    }, 'button[type=submit]')
    expect(ariaDisabled).toBe('true')
  }

  async deleteAndStartAgainLink() {
    await $('a*=Delete and start again').click()
  }
}

export default new ReportCheckAnswersPage()
