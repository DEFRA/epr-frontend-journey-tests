import { $ } from '@wdio/globals'

class ConfirmDiscardPRNPage {
  async headingText() {
    const element = await $('h1.govuk-heading-xl')
    await element.waitForExist({ timeout: 10000 })
    return await element.getText()
  }

  async preventDoubleClick() {
    return await $('button[type=submit]').getAttribute(
      'data-prevent-double-click'
    )
  }

  async discardAndStartAgain() {
    await $('button[type=submit]').click()
  }

  async selectBackLink() {
    await $('a*=Back').click()
  }
}

export default new ConfirmDiscardPRNPage()
