import { $ } from '@wdio/globals'

class ConfirmDeletePRNPage {
  async headingText() {
    const element = await $('h1.govuk-heading-xl')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async deletePrn() {
    await $('button[type=submit]').click()
  }

  async selectBackLink() {
    await $('a*=Back').click()
  }
}

export default new ConfirmDeletePRNPage()
