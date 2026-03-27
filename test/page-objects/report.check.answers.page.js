import { $ } from '@wdio/globals'

class ReportCheckAnswersPage {
  async headingText() {
    const element = await $('h1.govuk-heading-xl')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async createReport() {
    await $('button[type=submit]').click()
  }

  async deleteAndStartAgainLink() {
    await $('a*=Delete and start again').click()
  }
}

export default new ReportCheckAnswersPage()
