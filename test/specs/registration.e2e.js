import { browser, expect } from '@wdio/globals'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import UploadSummaryLogPage from '../page-objects/upload.summary.log.page.js'

describe('Registration', () => {
  it('Should be able to submit Summary Log spreadsheet', async () => {
    await WasteRecordsPage.open('123', '456')
    await expect(browser).toHaveTitle(expect.stringContaining('Registration'))
    await WasteRecordsPage.submitSummaryLogLink()
    await expect(browser).toHaveTitle(
      expect.stringContaining('Summary log: upload')
    )
    await UploadSummaryLogPage.uploadFile('resources/sample.xlsx')
    await UploadSummaryLogPage.continue()
    await browser.waitUntil(
      async () => {
        const pageText = await browser.$('body').getText()
        return pageText.includes('Your file is being uploaded')
      },
      {
        timeout: 5000,
        timeoutMsg:
          'Expected text "Your file is being uploaded" to be present on the page within 5 seconds'
      }
    )
    await browser.waitUntil(
      async () => {
        const pageText = await browser.$('body').getText()
        return pageText.includes('Your file is ready to submit')
      },
      {
        timeout: 10000,
        timeoutMsg:
          'Expected text "Your file is ready to submit" to be present on the page within 10 seconds'
      }
    )
  })

  it('Should get an error message with an empty Summary Log spreadsheet', async () => {
    await UploadSummaryLogPage.open(123, 456)
    await expect(browser).toHaveTitle(
      expect.stringContaining('Summary log: upload')
    )
    await UploadSummaryLogPage.uploadFile('resources/empty.xlsx')
    await UploadSummaryLogPage.continue()
    await browser.waitUntil(
      async () => {
        const errorText = await browser.$('#summary-log-upload-error').getText()
        return errorText.includes('The selected file is empty')
      },
      {
        timeout: 5000,
        timeoutMsg:
          'Expected error message "The selected file is empty" to be present on the page within 5 seconds'
      }
    )
  })
})
