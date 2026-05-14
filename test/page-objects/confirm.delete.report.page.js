import { $, browser, expect } from '@wdio/globals'

class ConfirmDeleteReportPage {
  async headingText() {
    const element = await $('h1.govuk-heading-xl')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async warningText() {
    const element = await $('p*=cannot be undone')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async confirmDeletion() {
    await $('button[type=submit]').click()
  }

  async confirmDeletionAndCheckDoubleClickPrevented() {
    const ariaDisabled = await browser.execute((selector) => {
      const btn = document.querySelector(selector)
      btn.click()
      return btn.getAttribute('aria-disabled')
    }, 'button[type=submit]')
    expect(ariaDisabled).toBe('true')
  }

  async selectBackLink() {
    await $('a*=Back').click()
  }
}

export default new ConfirmDeleteReportPage()
