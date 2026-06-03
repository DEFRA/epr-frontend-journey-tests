import { $, browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import UploadSummaryLogPage from 'page-objects/upload.summary.log.page.js'
import ReportsPage from 'page-objects/reports/reports.page.js'
import ReportDetailPage from 'page-objects/reports/report.detail.page.js'
import TonnesRecycledPage from '../page-objects/reports/tonnes.recycled.page.js'
import TonnesNotRecycledPage from '../page-objects/reports/tonnes.not.recycled.page.js'
import ReprocessorPrnSummaryPage from '../page-objects/reports/reprocessor.prn.summary.page.js'
import FreePrnsPage from '../page-objects/reports/free.prns.page.js'
import ReportSupportingInformationPage from 'page-objects/reports/report.supporting.information.page.js'
import ReportCheckAnswersPage from 'page-objects/reports/report.check.answers.page.js'
import MonthlyReportDraftDeclarationPage from 'page-objects/reports/monthly.report.draft.declaration.page.js'
import SummaryLogChangedErrorPage from 'page-objects/reports/summary.log.changed.error.page.js'
import { checkBodyText } from '../support/checks.js'
import {
  createAndRegisterDefraIdUser,
  createLinkedOrganisation,
  linkDefraIdUser,
  updateMigratedOrganisation
} from '../support/apicalls.js'

const PL_REG = 'R25SR500010912PL'
const PL_ACC = 'R-ACC12145PL'
const PL_FILE = `resources/sanity/reprocessorOutput_${PL_ACC}_${PL_REG}.xlsx`

const PA_REG = 'R25SR500010912PA'
const PA_ACC = 'R-ACC12145PA'
const PA_FILE = `resources/sanity/reprocessorOutput_${PA_ACC}_${PA_REG}.xlsx`

async function navigateReprocessorToSupportingInfo() {
  await TonnesRecycledPage.enterTonnage('10')
  await TonnesRecycledPage.continue()
  await TonnesNotRecycledPage.enterTonnage('5')
  await TonnesNotRecycledPage.continue()
  await ReprocessorPrnSummaryPage.enterRevenue('100')
  await ReprocessorPrnSummaryPage.continue()
  await FreePrnsPage.enterTonnage('0')
  await FreePrnsPage.continue()
}

async function setupAndCreateReport(material, regNumber, accNumber, filePath) {
  const orgDetails = await createLinkedOrganisation([
    { material, wasteProcessingType: 'Reprocessor' }
  ])

  const migrationResponse = await updateMigratedOrganisation(orgDetails.refNo, [
    {
      reprocessingType: 'output',
      regNumber,
      accNumber,
      status: 'approved'
    }
  ])

  const user = await createAndRegisterDefraIdUser(migrationResponse.email)
  await linkDefraIdUser(orgDetails.refNo, user.userId, migrationResponse.email)

  await HomePage.openStart()
  await HomePage.clickStartNow()
  await DefraIdStubPage.loginViaEmail(migrationResponse.email)

  await DashboardPage.selectTableLink(1, 1)
  await WasteRecordsPage.submitSummaryLogLink()
  await UploadSummaryLogPage.performUploadAndReturnToHomepage(filePath)

  await DashboardPage.selectTableLink(1, 1)
  await WasteRecordsPage.manageReportsLink()
  await ReportsPage.selectActiveActionLink(1)
  await ReportDetailPage.useThisData()
  await navigateReprocessorToSupportingInfo()
  await ReportSupportingInformationPage.continue()
  await ReportCheckAnswersPage.createReport()
  await checkBodyText('report created', 30)
  await $('a*=Go to reports').click()

  return { orgDetails, migrationResponse }
}

describe('Stale summary log report @staleReport', () => {
  it('should redirect to the stale SL error page when navigating to a stale report, with working Return and Delete buttons @staleReportNavigation', async () => {
    await setupAndCreateReport('Plastic (R3)', PL_REG, PL_ACC, PL_FILE)

    // Re-upload SL to make the existing report stale
    await HomePage.homeLink()
    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.submitSummaryLogLink()
    await UploadSummaryLogPage.performUploadAndReturnToHomepage(PL_FILE)

    // Navigating to the report now triggers the stale SL error page
    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.manageReportsLink()
    await ReportsPage.selectActiveActionLink(1)

    expect(await SummaryLogChangedErrorPage.headingText()).toBe(
      'Your summary log has changed'
    )

    // "Return to reports" navigates back to the reports list without deleting
    await SummaryLogChangedErrorPage.returnToReports()
    expect(await ReportsPage.headingText()).toContain('Reports')

    // Report is still present — navigating again shows the error page
    await ReportsPage.selectActiveActionLink(1)
    expect(await SummaryLogChangedErrorPage.headingText()).toBe(
      'Your summary log has changed'
    )

    // "Delete and start again" deletes the report and returns to reports with status Due
    await SummaryLogChangedErrorPage.deleteAndStartAgain()
    expect(await ReportsPage.headingText()).toContain('Reports')
    expect(await ReportsPage.getActiveStatusBadge(1)).toBe('Due')
    expect(await ReportsPage.getActiveStatusColour(1)).toBe('orange')

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('should redirect to the stale SL error page when submitting a report after SL re-upload @staleReportSubmit', async () => {
    const { orgDetails, migrationResponse } = await setupAndCreateReport(
      'Paper or board (R3)',
      PA_REG,
      PA_ACC,
      PA_FILE
    )

    // Open the submit/declaration page before re-uploading SL (GET renders normally)
    await ReportsPage.selectActiveActionLink(1)

    // Re-upload SL in a new tab while the submit page remains open in the original tab
    const originalTab = await browser.getWindowHandle()
    await browser.newWindow('about:blank')
    await browser.url(
      `/organisations/${orgDetails.refNo}/registrations/${migrationResponse.registrationIds[0]}/summary-logs/upload`
    )
    await UploadSummaryLogPage.uploadFile(PA_FILE)
    await UploadSummaryLogPage.continue()
    await checkBodyText('Check before confirming upload', 60)
    await UploadSummaryLogPage.confirmAndSubmit()
    await checkBodyText('Summary log uploaded', 60)
    await browser.closeWindow()
    await browser.switchToWindow(originalTab)

    // Submit from the original tab — the POST detects the stale SL and redirects
    await MonthlyReportDraftDeclarationPage.confirmAndSubmit()

    expect(await SummaryLogChangedErrorPage.headingText()).toBe(
      'Your summary log has changed'
    )

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
