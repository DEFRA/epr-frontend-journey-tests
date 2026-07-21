import { $, browser } from '@wdio/globals'

class ReportViewPage {
  open(orgId, regId, year, cadence, period, submissionNumber = 1) {
    return browser.url(
      `/organisations/${orgId}/registrations/${regId}/reports/${year}/${cadence}/${period}/submissions/${submissionNumber}/view`
    )
  }

  async headingText() {
    const element = await $('h1.govuk-heading-xl')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async makeChangesLink() {
    await $('a.govuk-button=Make changes to this report').click()
  }

  async hasMakeChangesLink() {
    return await $('a.govuk-button=Make changes to this report').isExisting()
  }
}

export default new ReportViewPage()
