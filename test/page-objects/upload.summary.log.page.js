import { browser, $ } from '@wdio/globals'

class UploadSummaryLogPage {
  open(orgId, regId) {
    return browser.url(
      `/organisations/${orgId}/registrations/${regId}/summary-logs/upload`
    )
  }

  async uploadFile(filePath) {
    const remoteFilePath = await browser.uploadFile(filePath)
    await $('#summary-log-upload').setValue(remoteFilePath)
  }

  async continue() {
    await $('#main-content button[type=submit]').click()
  }

  async fileValidatedHeadline() {
    await browser.waitUntil(
      async function () {
        return (await $('#main-content h1').getText()) !== ''
      },
      {
        timeout: 5000,
        timeoutMsg: 'expected file validated headline to be visible after 5s'
      }
    )
    return await $('#main-content h1').getText()
  }

  async confirmAndSubmit() {
    await $('#main-content button[type=submit]').click()
  }

  async clickOnReturnToHomePage() {
    await $('a*=Return to home').click()
  }

  async returnToSubmissionPage() {
    await $('#main-content form > div.govuk-button-group > a').click()
  }
}

export default new UploadSummaryLogPage()
