import { $, browser, expect } from '@wdio/globals'

class AccountLinkingPage {
  async selectOrganisation() {
    await $('#organisation-id').click()
  }

  async confirmLinkAndCheckDoubleClickPrevented() {
    const ariaDisabled = await browser.execute((selector) => {
      const btn = document.querySelector(selector)
      btn.click()
      return btn.getAttribute('aria-disabled')
    }, 'button[type=submit]')
    expect(ariaDisabled).toBe('true')
  }
}

export default new AccountLinkingPage()
