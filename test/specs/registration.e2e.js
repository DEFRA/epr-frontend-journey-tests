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
    await UploadSummaryLogPage.uploadFile('sample.xlsx')
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
  })
})
