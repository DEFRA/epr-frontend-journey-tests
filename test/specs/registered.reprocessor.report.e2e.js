import { browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import UploadSummaryLogPage from 'page-objects/upload.summary.log.page.js'
import ReportsPage from '../page-objects/reports.page.js'
import ReportDetailPage from '../page-objects/report.detail.page.js'
import TonnesRecycledPage from '../page-objects/reports/tonnes.recycled.page.js'
import TonnesNotRecycledPage from '../page-objects/reports/tonnes.not.recycled.page.js'
import ReportSupportingInformationPage from '../page-objects/report.supporting.information.page.js'
import ReportCheckAnswersPage from '../page-objects/report.check.answers.page.js'
import ConfirmDeleteReportPage from '../page-objects/confirm.delete.report.page.js'
import {
  createAndRegisterDefraIdUser,
  createLinkedOrganisation,
  linkDefraIdUser,
  updateMigratedOrganisation
} from '../support/apicalls.js'
import {
  checkBodyText,
  checkBodyTextDoesNotInclude
} from '../support/checks.js'

const REG_NUMBER = 'R25SR5111050912PA'

async function setupRegisteredOnlyReprocessor() {
  const organisationDetails = await createLinkedOrganisation([
    {
      material: 'Paper or board (R3)',
      wasteProcessingType: 'Reprocessor',
      withoutAccreditation: true
    }
  ])

  const migrationResponse = await updateMigratedOrganisation(
    organisationDetails.refNo,
    [
      {
        reprocessingType: 'output',
        regNumber: REG_NUMBER,
        status: 'approved',
        withoutAccreditation: true
      }
    ]
  )

  const user = await createAndRegisterDefraIdUser(migrationResponse.email)
  await linkDefraIdUser(
    organisationDetails.refNo,
    user.userId,
    migrationResponse.email
  )

  await HomePage.openStart()
  await HomePage.clickStartNow()
  await DefraIdStubPage.loginViaEmail(migrationResponse.email)

  return { organisationDetails, migrationResponse }
}

describe('Registered-only reprocessor report flow @registeredOnlyReprocessor', () => {
  it('should complete the full registered-only reprocessor report flow through to confirmation @registeredOnlyReprocessorFullFlow', async () => {
    await setupRegisteredOnlyReprocessor()

    // Upload registered-only reprocessor summary log
    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.submitSummaryLogLink()
    await UploadSummaryLogPage.performUploadAndReturnToHomepage(
      'resources/reprocessor-output-regonly.xlsx'
    )

    // Navigate to reports
    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.manageReportsLink()

    // Start the report — should redirect to tonnes-recycled
    await ReportsPage.selectActionLink(1)
    await ReportDetailPage.useThisData()

    // --- Tonnes recycled page ---
    const tonnesRecycledHeading = await TonnesRecycledPage.headingText()
    expect(tonnesRecycledHeading).toBeTruthy()

    await TonnesRecycledPage.enterTonnage('12.50')
    await TonnesRecycledPage.continue()

    // --- Tonnes not recycled page ---
    const tonnesNotRecycledHeading = await TonnesNotRecycledPage.headingText()
    expect(tonnesNotRecycledHeading).toBeTruthy()

    await TonnesNotRecycledPage.enterTonnage('7.50')
    await TonnesNotRecycledPage.continue()

    // --- Supporting information page (no PRN pages for registered-only) ---
    const supportingInfoHeading =
      await ReportSupportingInformationPage.headingText()
    expect(supportingInfoHeading).toBe(
      'Add supporting information for your regulator (optional)'
    )
    await ReportSupportingInformationPage.continue()

    // --- Check your answers page ---
    const checkHeading = await ReportCheckAnswersPage.headingText()
    expect(checkHeading).toBe('Check your answers before creating draft report')

    // Verify recycling activity values displayed
    await checkBodyText('12.50', 10)
    await checkBodyText('7.50', 10)

    // Verify NO PRN section present
    await checkBodyTextDoesNotInclude('PRN revenue', 5)
    await checkBodyTextDoesNotInclude('Free PRNs', 5)
    await checkBodyTextDoesNotInclude('Average price per tonne', 5)

    // Submit the report
    await ReportCheckAnswersPage.createReport()

    // Verify confirmation page
    await checkBodyText('report created', 30)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('should return 404 when navigating directly to PRN pages @registeredOnlyReprocessorRouteGuard', async () => {
    const { organisationDetails, migrationResponse } =
      await setupRegisteredOnlyReprocessor()

    // Try to access prn-summary directly — should get 404
    await browser.url(
      `/organisations/${organisationDetails.refNo}/registrations/${migrationResponse.registrationIds[0]}/reports/2026/quarterly/1/prn-summary`
    )
    await checkBodyText('404', 10)
    await checkBodyText('Page not found', 10)

    // Try to access free-prns directly — should get 404
    await browser.url(
      `/organisations/${organisationDetails.refNo}/registrations/${migrationResponse.registrationIds[0]}/reports/2026/quarterly/1/free-prns`
    )
    await checkBodyText('404', 10)
    await checkBodyText('Page not found', 10)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('should navigate back correctly through the registered-only reprocessor flow @registeredOnlyReprocessorBackLinks', async () => {
    await setupRegisteredOnlyReprocessor()

    // Upload summary log
    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.submitSummaryLogLink()
    await UploadSummaryLogPage.performUploadAndReturnToHomepage(
      'resources/reprocessor-output-regonly.xlsx'
    )

    // Navigate to reports and start report
    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.manageReportsLink()
    await ReportsPage.selectActionLink(1)
    await ReportDetailPage.useThisData()

    // On tonnes-recycled — back link goes to detail page
    await TonnesRecycledPage.selectBackLink()
    const detailHeading = await ReportDetailPage.headingText()
    expect(detailHeading).toBeTruthy()

    // Go forward again
    await ReportDetailPage.useThisData()

    // Continue to tonnes-not-recycled
    await TonnesRecycledPage.enterTonnage('12.50')
    await TonnesRecycledPage.continue()

    // On tonnes-not-recycled — back link goes to tonnes-recycled
    await TonnesNotRecycledPage.selectBackLink()
    const backToTonnesRecycled = await TonnesRecycledPage.headingText()
    expect(backToTonnesRecycled).toBeTruthy()

    // Continue to supporting-information (skips PRN pages)
    await TonnesRecycledPage.enterTonnage('12.50')
    await TonnesRecycledPage.continue()
    await TonnesNotRecycledPage.enterTonnage('7.50')
    await TonnesNotRecycledPage.continue()

    // On supporting-information — back link goes to tonnes-not-recycled (not free-prns)
    await ReportSupportingInformationPage.selectBackLink()
    const backToTonnesNotRecycled = await TonnesNotRecycledPage.headingText()
    expect(backToTonnesNotRecycled).toBeTruthy()

    // Clean up
    await TonnesNotRecycledPage.deleteReportLink()
    await ConfirmDeleteReportPage.confirmDeletion()

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
