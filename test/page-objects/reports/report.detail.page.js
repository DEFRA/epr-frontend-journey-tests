import { $ } from '@wdio/globals'
import { checkDoubleClickPrevented } from '../../support/double-click.js'

class ReportDetailPage {
  async headingText() {
    const element = await $('h1.govuk-heading-xl')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async useThisData() {
    await $('button[type=submit]').click()
  }

  async useThisDataAndCheckDoubleClickPrevented() {
    await checkDoubleClickPrevented('button[type=submit]')
  }
}

export default new ReportDetailPage()
