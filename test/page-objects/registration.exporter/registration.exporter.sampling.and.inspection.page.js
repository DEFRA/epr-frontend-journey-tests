import { Page } from 'page-objects/page.js'

class RegistrationExporterSamplingAndInspectionPage extends Page {
  async uploadFile(filePath) {
    const remoteFilePath = await browser.uploadFile(filePath)
    await $(
      '#main-content > div > div > form:nth-child(5) > div > input'
    ).setValue(remoteFilePath)
    await $('#main-content > div > div > form:nth-child(5) > button').click()

    const elem = $('#uploadedFilesContainer > p:nth-child(2)')
    await browser.waitUntil(
      async function () {
        return (await elem.getText()) === '1 file uploaded'
      },
      {
        timeout: 5000,
        timeoutMsg: 'expected 1 file to be uploaded after 5s'
      }
    )
  }

  async waitForContinueButton() {
    // #uploadedFilesContainer > dl > div > dd.govuk-summary-list__value > strong
    await $('#main-content div.govuk-button-group > button').waitForEnabled({
      timeout: 10000
    })
  }
}

export default new RegistrationExporterSamplingAndInspectionPage()
