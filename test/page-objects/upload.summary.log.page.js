import { browser, $, $$ } from '@wdio/globals'
import {
  checkBodyText,
  checkBodyTextDoesNotInclude
} from '../support/checks.js'
import { checkDoubleClickPrevented } from '../support/double-click.js'

class UploadSummaryLogPage {
  open(orgId, regId) {
    return browser.url(
      `/organisations/${orgId}/registrations/${regId}/summary-logs/upload`
    )
  }

  async performUploadAndReturnToHomepage(filePath) {
    await this.uploadFile(filePath)
    await this.continue()

    await checkBodyText('Your file is being checked', 30)
    await checkBodyText('Check before confirming upload', 60)
    await this.confirmAndSubmit()

    await checkBodyText('Your waste records are being updated', 30)
    await checkBodyTextDoesNotInclude('Declaration', 10)
    await checkBodyText('Summary log uploaded', 60)
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

  async getValidationErrors() {
    return await $$(
      '[data-testid="app-page-body"] table.govuk-table tbody tr'
    ).map(async (row) => {
      const values = await row.$$('td').map((cell) => cell.getText())

      // A record's first row carries the rowspanned Row ID + Section cells
      // (6 cells); its remaining cells render only the 4 per-cell columns.
      if (values.length === 6) {
        const [rowId, section, columnHeader, cell, dataEntered, errorMessage] =
          values
        return { rowId, section, columnHeader, cell, dataEntered, errorMessage }
      }

      const [columnHeader, cell, dataEntered, errorMessage] = values
      return { rowId: '', section: '', columnHeader, cell, dataEntered, errorMessage }
    })
  }

  async confirmAndSubmit() {
    await $('#main-content button[type=submit]').click()
  }

  async confirmAndCheckDoubleClickPrevented() {
    await checkDoubleClickPrevented('#main-content button[type=submit]', {
      waitForNavigation: false
    })
  }

  async clickOnReturnToHomePage() {
    await $('a*=Return to home').click()
  }

  async returnToSubmissionPage() {
    await $('#main-content form > div.govuk-button-group > a').click()
  }
}

export default new UploadSummaryLogPage()
