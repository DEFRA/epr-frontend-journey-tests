import { browser, $ } from '@wdio/globals'
import { checkBodyText } from '../support/checks.js'

class UploadSummaryLogPage {
  open(orgId, regId) {
    return browser.url(
      `/organisations/${orgId}/registrations/${regId}/summary-logs/upload`
    )
  }

  async performUpload(filePath) {
    await this.uploadFile(filePath)
    await this.continue()

    await checkBodyText('Your file is being checked', 30)
    await checkBodyText('Check before confirming upload', 30)
    await this.confirmAndSubmit()

    await checkBodyText('Your waste records are being updated', 30)
    await checkBodyText('Summary log uploaded', 30)
    await this.clickOnReturnToHomePage()
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
