import { $, browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import UploadSummaryLogPage from 'page-objects/upload.summary.log.page.js'
import ReportsPage from '../page-objects/reports.page.js'
import ReportDetailPage from '../page-objects/report.detail.page.js'
import TonnesNotExportedPage from '../page-objects/reports/tonnes.not.exported.page.js'
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

const REG_NUMBER = 'E25SR500030913PA'

async function uploadAndNavigateToReports() {
  await DashboardPage.selectTableLink(1, 1)
  await WasteRecordsPage.submitSummaryLogLink()
  await UploadSummaryLogPage.performUploadAndReturnToHomepage(
    'resources/exporter-regonly.xlsx'
  )
  await DashboardPage.selectTableLink(1, 1)
  await WasteRecordsPage.manageReportsLink()
}

async function setupRegisteredOnlyExporter() {
  const organisationDetails = await createLinkedOrganisation([
    {
      material: 'Paper or board (R3)',
      wasteProcessingType: 'Exporter',
      withoutAccreditation: true
    }
  ])

  const migrationResponse = await updateMigratedOrganisation(
    organisationDetails.refNo,
    [
      {
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

describe('Registered-only exporter report flow @registeredOnlyExporter', () => {
  it('should complete the full registered-only exporter report flow through to confirmation @registeredOnlyExporterFullFlow', async () => {
    await setupRegisteredOnlyExporter()
    await uploadAndNavigateToReports()

    // Start the report — should redirect to tonnes-not-exported
    await ReportsPage.selectActionLink(1)
    await ReportDetailPage.useThisData()

    // --- Tonnes not exported page ---
    const tonnesNotExportedHeading = await TonnesNotExportedPage.headingText()
    expect(tonnesNotExportedHeading).toBeTruthy()

    await TonnesNotExportedPage.enterTonnage('5.50')
    await TonnesNotExportedPage.continue()

    // --- Supporting information page (no PERN pages for registered-only) ---
    const supportingInfoHeading =
      await ReportSupportingInformationPage.headingText()
    expect(supportingInfoHeading).toBe(
      'Add supporting information for your regulator (optional)'
    )
    await ReportSupportingInformationPage.continue()

    // --- Check your answers page ---
    const checkHeading = await ReportCheckAnswersPage.headingText()
    expect(checkHeading).toBe('Check your answers before creating draft report')

    // Verify tonnage not exported value and change link present on CYA
    await checkBodyText('5.50', 10)
    const changeLink = await $('a[href*="tonnes-not-exported"]')
    expect(await changeLink.isExisting()).toBe(true)

    // Verify NO PERN section present
    await checkBodyTextDoesNotInclude('PERN revenue', 5)
    await checkBodyTextDoesNotInclude('Free PERNs', 5)

    // Submit the report
    await ReportCheckAnswersPage.createReport()

    // Verify confirmation page
    await checkBodyText('report created', 30)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('should return 404 when navigating directly to PERN pages @registeredOnlyExporterRouteGuard', async () => {
    const { organisationDetails, migrationResponse } =
      await setupRegisteredOnlyExporter()

    // Try to access prn-summary directly — should get 404
    await browser.url(
      `/organisations/${organisationDetails.refNo}/registrations/${migrationResponse.registrationIds[0]}/reports/2026/quarterly/1/prn-summary`
    )
    await checkBodyText('404', 10)
    await checkBodyText('Page not found', 10)

    // Try to access free-perns directly — should get 404
    await browser.url(
      `/organisations/${organisationDetails.refNo}/registrations/${migrationResponse.registrationIds[0]}/reports/2026/quarterly/1/free-perns`
    )
    await checkBodyText('404', 10)
    await checkBodyText('Page not found', 10)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('should redirect to reports list when navigating back to check-answers after report is created @registeredOnlyExporterCheckAnswersGuard', async () => {
    await setupRegisteredOnlyExporter()
    await uploadAndNavigateToReports()

    // Complete the full flow through to confirmation
    await ReportsPage.selectActionLink(1)
    await ReportDetailPage.useThisData()
    await TonnesNotExportedPage.enterTonnage('5.50')
    await TonnesNotExportedPage.continue()
    await ReportSupportingInformationPage.continue()
    await ReportCheckAnswersPage.createReport()
    await checkBodyText('report created', 30)

    // Navigate back to check-answers — the guard should redirect to the reports list
    await browser.back()

    const reportsHeading = await ReportsPage.headingText()
    expect(reportsHeading).toContain('Reports')

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('should navigate back correctly through the registered-only exporter flow @registeredOnlyExporterBackLinks', async () => {
    await setupRegisteredOnlyExporter()
    await uploadAndNavigateToReports()

    await ReportsPage.selectActionLink(1)
    await ReportDetailPage.useThisData()

    // On tonnes-not-exported — back link goes to detail page
    await TonnesNotExportedPage.selectBackLink()
    const detailHeading = await ReportDetailPage.headingText()
    expect(detailHeading).toBeTruthy()

    // Go forward again
    await ReportDetailPage.useThisData()

    // Continue to tonnage not exported page
    await TonnesNotExportedPage.enterTonnage('5.50')

    await TonnesNotExportedPage.continue()

    // On supporting-information — back link goes to tonnes-not-exported (not free-perns)
    await ReportSupportingInformationPage.selectBackLink()
    const backToTonnesNotExported = await TonnesNotExportedPage.headingText()
    expect(backToTonnesNotExported).toBeTruthy()

    // Clean up
    await TonnesNotExportedPage.deleteReportLink()
    await ConfirmDeleteReportPage.confirmDeletion()

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
