import { $ } from '@wdio/globals'

class ReportSupportingInformationPage {
  async headingText() {
    const element = await $('h1.govuk-heading-xl')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async continue() {
    await $('button[value="continue"]').click()
  }

  async deleteReportLink() {
    await $('a*=Delete report').click()
  }
}

export default new ReportSupportingInformationPage()
