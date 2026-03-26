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
import ConfirmDeleteReportPage from '../page-objects/confirm.delete.report.page.js'
import {
  createAndRegisterDefraIdUser,
  createLinkedOrganisation,
  linkDefraIdUser,
  updateMigratedOrganisation
} from '../support/apicalls.js'

describe('Deleting an in-progress report', () => {
  it('should delete from supporting information and check your answers pages @delreport', async () => {
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

    // --- Delete from supporting information page ---

    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.manageReportsLink()

    // Create report
    await ReportsPage.selectActionLink(1)
    await ReportDetailPage.useThisData()

    // On supporting information page — click delete
    const supportingInfoHeading =
      await ReportSupportingInformationPage.headingText()
    expect(supportingInfoHeading).toBe(
      'Add supporting information for your regulator (optional)'
    )
    await ReportSupportingInformationPage.deleteReportLink()

    // Confirm deletion page — verify content
    let deleteHeading = await ConfirmDeleteReportPage.headingText()
    expect(deleteHeading).toBe('Confirm deletion of this report')

    const warningText = await ConfirmDeleteReportPage.warningText()
    expect(warningText).toContain('This action cannot be undone')

    // Test back link
    await ConfirmDeleteReportPage.selectBackLink()
    const backHeading = await ReportSupportingInformationPage.headingText()
    expect(backHeading).toBe(
      'Add supporting information for your regulator (optional)'
    )

    // Now delete
    await ReportSupportingInformationPage.deleteReportLink()
    await ConfirmDeleteReportPage.confirmDeletion()

    // Should be back on reports list with status reverted to Due
    let reportsHeading = await ReportsPage.headingText()
    expect(reportsHeading).toContain('Reports')

    let statusBadge = await ReportsPage.getStatusBadge(1)
    expect(statusBadge).toBe('Due')

    // --- Delete from check your answers page ---

    // Create report again
    await ReportsPage.selectActionLink(1)
    await ReportDetailPage.useThisData()

    // Continue through supporting information
    await ReportSupportingInformationPage.continue()

    // On check your answers page — click delete and start again
    const checkHeading = await ReportCheckAnswersPage.headingText()
    expect(checkHeading).toBe('Check your answers before creating draft report')
    await ReportCheckAnswersPage.deleteAndStartAgainLink()

    // Confirm deletion page — test back link goes to supporting information
    deleteHeading = await ConfirmDeleteReportPage.headingText()
    expect(deleteHeading).toBe('Confirm deletion of this report')

    await ConfirmDeleteReportPage.selectBackLink()
    const backToSupportingInfo =
      await ReportSupportingInformationPage.headingText()
    expect(backToSupportingInfo).toBe(
      'Add supporting information for your regulator (optional)'
    )

    // Navigate back to check answers and delete
    await ReportSupportingInformationPage.continue()
    await ReportCheckAnswersPage.deleteAndStartAgainLink()
    await ConfirmDeleteReportPage.confirmDeletion()

    // Should be back on reports list with status reverted to Due
    reportsHeading = await ReportsPage.headingText()
    expect(reportsHeading).toBe('Reports')

    statusBadge = await ReportsPage.getStatusBadge(1)
    expect(statusBadge).toBe('Due')

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
