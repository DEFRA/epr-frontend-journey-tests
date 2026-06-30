import { browser, $, $$ } from '@wdio/globals'
import {
  checkBodyText,
  checkBodyTextDoesNotInclude
} from '../support/checks.js'
import { SummaryLogUploadActions } from './summary-log-upload-actions.js'
import EnhancedCheckSummaryLogPage from './enhanced.check.summary.log.page.js'

class UploadSummaryLogPage extends SummaryLogUploadActions {
  async headingText() {
    const element = await $('h1.govuk-heading-xl')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  // TODO: flag switchover - replaced by performUploadAndReturnToHomepageEnhanced below.
  async performUploadAndReturnToHomepage(filePath) {
    await this.uploadFile(filePath)
    await this.continue()

    await checkBodyText('Your summary log is being checked', 30)
    await checkBodyText('Check before confirming upload', 60)
    await this.confirmAndSubmit()

    await checkBodyText('Your waste records are being updated', 30)
    await checkBodyTextDoesNotInclude('Declaration', 10)
    await checkBodyText('Summary log uploaded', 60)
    await this.clickOnReturnToHomePage()
  }

  // The enhanced (CMA) upload flow. Kept live (not commented) so it can't drift;
  // used by the CMA spec now, becomes performUploadAndReturnToHomepage at switchover.
  async performUploadAndReturnToHomepageEnhanced(filePath) {
    await this.uploadFile(filePath)
    await this.continue()

    await checkBodyText('Your summary log is being checked', 30)
    await checkBodyText('Upload your summary log', 60)

    await EnhancedCheckSummaryLogPage.upload()

    await checkBodyText('Your waste records are being updated', 30)
    await checkBodyText('Summary log uploaded', 60)
    await this.clickOnReturnToHomePage()
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
      return {
        rowId: '',
        section: '',
        columnHeader,
        cell,
        dataEntered,
        errorMessage
      }
    })
  }

  async expandLoadsList() {
    // Excluded/non-balance-affecting loads render inside govuk-details
    // accordions, so their per-row reason text is only in innerText when open.
    // Force every accordion open (idempotent — avoids toggling closed any that
    // already default to open).
    await browser.execute(() => {
      document.querySelectorAll('details.govuk-details').forEach((details) => {
        details.setAttribute('open', '')
      })
    })
  }

  async confirmAndSubmit() {
    await $('#main-content button[type=submit]').click()
  }

  async returnToSubmissionPage() {
    await $('#main-content form > div.govuk-button-group > a').click()
  }
}

export default new UploadSummaryLogPage()
