import { browser, expect } from '@wdio/globals'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import UploadSummaryLogPage from '../page-objects/upload.summary.log.page.js'
import { checkBodyText, checkUploadErrorText } from '../support/checks.js'

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
    await checkBodyText('Your file is being uploaded', 5)
    await checkBodyText('Your file is ready to submit', 10)
  })

  it('Should get an error message with an empty Summary Log spreadsheet', async () => {
    await UploadSummaryLogPage.open(123, 456)
    await expect(browser).toHaveTitle(
      expect.stringContaining('Summary log: upload')
    )
    await UploadSummaryLogPage.uploadFile('resources/empty.xlsx')
    await UploadSummaryLogPage.continue()
    await checkUploadErrorText(
      '#summary-log-upload-error',
      'The selected file is empty',
      5
    )
  })
})
