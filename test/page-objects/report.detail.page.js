import { $ } from '@wdio/globals'

class ReportDetailPage {
  async headingText() {
    const element = await $('h1.govuk-heading-xl')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async useThisData() {
    await $('button[type=submit]').click()
  }
}

export default new ReportDetailPage()
