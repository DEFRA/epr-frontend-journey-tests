import { $, browser, expect } from '@wdio/globals'
import { checkDoubleClickPrevented } from '../../support/double-click.js'
import UploadSummaryLogPage from '../upload.summary.log.page.js'
import ReportsPage from './reports.page.js'

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

  async uploadNewSummaryLog() {
    await $('a.govuk-button--secondary').click()
  }

  async cancelAndReturnToReports() {
    await $('a=Cancel and return to reports').click()
  }

  async verifyDetailPageButtons() {
    expect(await this.headingText()).toContain('Your summary log data')

    await this.uploadNewSummaryLog()
    expect(await UploadSummaryLogPage.headingText()).toContain(
      'Upload your summary log'
    )

    await browser.back()
    await this.cancelAndReturnToReports()
    expect(await ReportsPage.headingText()).toContain('Reports')
  }
}

export default new ReportDetailPage()
