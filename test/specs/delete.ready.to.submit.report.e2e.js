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
import MonthlyReportDraftDeclarationPage from '../page-objects/reports/monthly.report.draft.declaration.page.js'
import ConfirmDeleteReportPage from '../page-objects/confirm.delete.report.page.js'
import {
  createAndRegisterDefraIdUser,
  createLinkedOrganisation,
  linkDefraIdUser,
  updateMigratedOrganisation
} from '../support/apicalls.js'

describe('Deleting a ready to submit report', () => {
  it('should delete from the submit page @delreportsubmit', async () => {
    const regNumber = 'R25SR500010912PL'
    const accNumber = 'R-ACC12145PL'

    const organisationDetails = await createLinkedOrganisation([
      {
        material: 'Plastic (R3)',
        wasteProcessingType: 'Reprocessor'
      }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber,
          accNumber,
          status: 'approved'
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

    // Upload summary log so report data exists
    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.submitSummaryLogLink()

    const filePath = `resources/sanity/reprocessorOutput_${accNumber}_${regNumber}.xlsx`
    await UploadSummaryLogPage.performUploadAndReturnToHomepage(filePath)

    // Navigate to reports and create a draft report
    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.manageReportsLink()
    await ReportsPage.selectActionLink(1)
    await ReportDetailPage.useThisData()
    await ReportSupportingInformationPage.continue()

    // Create the draft report (transitions to ready_to_submit)
    await ReportCheckAnswersPage.createReport()

    // On the submit/declaration page — click delete report
    await MonthlyReportDraftDeclarationPage.deleteReport()

    // Verify confirm deletion page
    const deleteHeading = await ConfirmDeleteReportPage.headingText()
    expect(deleteHeading).toBe('Confirm deletion of this report')

    const warningText = await ConfirmDeleteReportPage.warningText()
    expect(warningText).toContain('This action cannot be undone')

    // Confirm deletion
    await ConfirmDeleteReportPage.confirmDeletion()

    // Should be back on reports list with status reverted to due
    const reportsHeading = await ReportsPage.headingText()
    expect(reportsHeading).toContain('Reports')

    const statusBadge = await ReportsPage.getStatusBadge(1)
    expect(statusBadge).toBe('Due')

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
