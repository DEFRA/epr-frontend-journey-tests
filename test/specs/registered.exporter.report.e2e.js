import { browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import UploadSummaryLogPage from 'page-objects/upload.summary.log.page.js'
import ReportsPage from '../page-objects/reports.page.js'
import ReportDetailPage from '../page-objects/report.detail.page.js'
import ReportSupportingInformationPage from '../page-objects/report.supporting.information.page.js'
import ReportCheckAnswersPage from '../page-objects/report.check.answers.page.js'
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

    // Upload registered-only exporter summary log
    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.submitSummaryLogLink()
    await UploadSummaryLogPage.performUploadAndReturnToHomepage(
      'resources/exporter-regonly.xlsx'
    )

    // Navigate to reports
    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.manageReportsLink()

    // Start the report — should redirect to supporting-information for registered-only exporter
    await ReportsPage.selectActionLink(1)
    await ReportDetailPage.useThisData()

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

    // Verify NO PERN section present
    await checkBodyTextDoesNotInclude('Total revenue of PERNs', 5)
    await checkBodyTextDoesNotInclude('Total tonnage of PERNs issued for free', 5)
    await checkBodyTextDoesNotInclude('Average price per tonne', 5)

    // Submit the report
    await ReportCheckAnswersPage.createReport()

    // Verify confirmation page
    await checkBodyText('report created', 30)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
