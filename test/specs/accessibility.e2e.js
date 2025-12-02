import HomePage from 'page-objects/homepage.js'

import { runAccessibilityAudit } from '../support/chrome.accessibility.js'
import WasteRecordsPage from 'page-objects/waste.records.page.js'
import UploadSummaryLogPage from 'page-objects/upload.summary.log.page.js'
import { logViolationsToAllure } from '../support/accessibility.js'

function failOnViolationLevel(results) {
  results.violations.forEach((violation) => {
    if (violation.impact === 'critical' || violation.impact === 'serious') {
      throw new Error(
        'At least one Serious or Critical accessibility violation found'
      )
    }
  })
}

describe('WCAG Accessibility', () => {
  it('Should have no critical accessibility violations for Home Page', async () => {
    await HomePage.open()

    const results = await runAccessibilityAudit()
    await logViolationsToAllure(results.violations)
    failOnViolationLevel(results)
  })

  it('Should have no critical accessibility violations for Packaging Waste Records Page', async () => {
    await WasteRecordsPage.open('123', '456')

    const results = await runAccessibilityAudit()
    await logViolationsToAllure(results.violations)
    failOnViolationLevel(results)
  })

  it('Should have no critical accessibility violations for Upload Summary Logs Page', async () => {
    await UploadSummaryLogPage.open('123', '456')

    const results = await runAccessibilityAudit()
    await logViolationsToAllure(results.violations)
    failOnViolationLevel(results)
  })
})
