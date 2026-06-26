import { checkBodyText } from '../support/checks.js'
import { summaryLogUploadActions } from './summary-log-upload-actions.js'
import EnhancedCheckSummaryLogPage from './enhanced.check.summary.log.page.js'

class EnhancedUploadSummaryLogPage {
  async performUploadAndReturnToHomepage(filePath) {
    await this.uploadFile(filePath)
    await this.continue()

    await checkBodyText('Your summary log is being checked', 30)
    await checkBodyText('Upload your summary log', 60)

    await EnhancedCheckSummaryLogPage.upload()

    await checkBodyText('Your waste records are being updated', 30)
    await checkBodyText('Summary log uploaded', 60)
    await this.clickOnReturnToHomePage()
  }
}

// Shared, flag-independent upload-page actions (open/uploadFile/continue/etc.)
Object.assign(EnhancedUploadSummaryLogPage.prototype, summaryLogUploadActions)

export default new EnhancedUploadSummaryLogPage()
