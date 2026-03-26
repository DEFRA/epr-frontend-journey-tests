import { $ } from '@wdio/globals'

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

  async selectBackLink() {
    await $('a*=Back').click()
  }
}

export default new ConfirmDeleteReportPage()
