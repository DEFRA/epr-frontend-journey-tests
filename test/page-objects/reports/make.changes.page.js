import { $ } from '@wdio/globals'
import { checkDoubleClickPrevented } from '../../support/double-click.js'

class MakeChangesPage {
  async headingText() {
    const element = await $('h1.govuk-heading-xl')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async useThisReportsSummaryLog() {
    await $("button=Use this report's summary log").click()
  }

  async useThisReportsSummaryLogAndCheckDoubleClickPrevented() {
    await checkDoubleClickPrevented("button=Use this report's summary log")
  }

  async uploadNewSummaryLog() {
    await $('a.govuk-button--secondary=Upload new summary log').click()
  }

  async cancel() {
    await $('a=Cancel').click()
  }
}

export default new MakeChangesPage()
