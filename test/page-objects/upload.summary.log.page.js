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

  async getValidationErrors(tableIndex = 1) {
    let i = 0
    return await $$(
      `table.govuk-table:nth-of-type(${tableIndex}) tbody tr`
    ).map(async (row) => {
      if (i++ > 0) {
        const [column, cell, valueEntered, problem] = await Promise.all([
          row.$('td:nth-child(1)'),
          row.$('td:nth-child(2)'),
          row.$('td:nth-child(3)'),
          row.$('td:nth-child(4)')
        ])
        return {
          rowId: '',
          column: await column.getText(),
          cell: await cell.getText(),
          valueEntered: await valueEntered.getText(),
          problem: await problem.getText()
        }
      }

      const [rowId, column, cell, valueEntered, problem] = await Promise.all([
        row.$('td:nth-child(1)'),
        row.$('td:nth-child(2)'),
        row.$('td:nth-child(3)'),
        row.$('td:nth-child(4)'),
        row.$('td:nth-child(5)')
      ])
      return {
        rowId: await rowId.getText(),
        column: await column.getText(),
        cell: await cell.getText(),
        valueEntered: await valueEntered.getText(),
        problem: await problem.getText()
      }
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
