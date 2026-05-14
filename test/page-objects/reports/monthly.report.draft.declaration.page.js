import { $, browser, expect } from '@wdio/globals'

class MonthlyReportDraftDeclarationPage {
  async reportsPageLink() {
    await $('a*=Reports').click()
  }

  async confirmAndSubmit() {
    const buttonElement = await $('#main-content button[type=submit]')
    await buttonElement.waitForClickable({ timeout: 5000 })
    await buttonElement.click()
  }

  async submitAndCheckDoubleClickPrevented() {
    const ariaDisabled = await browser.execute((selector) => {
      const btn = document.querySelector(selector)
      btn.click()
      return btn.getAttribute('aria-disabled')
    }, '#main-content button[type=submit]')
    expect(ariaDisabled).toBe('true')
  }

  async deleteReport() {
    await $('a*=Delete report').click()
  }
}

export default new MonthlyReportDraftDeclarationPage()
