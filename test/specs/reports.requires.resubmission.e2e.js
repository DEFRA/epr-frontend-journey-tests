import { browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import UploadSummaryLogPage from '../page-objects/upload.summary.log.page.js'
import EnhancedCheckSummaryLogPage from '../page-objects/enhanced.check.summary.log.page.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import { checkBodyText } from '../support/checks.js'
import {
  createAndRegisterDefraIdUser,
  createLinkedOrganisation,
  linkDefraIdUser,
  updateMigratedOrganisation,
  seedSubmittedReport
} from '../support/apicalls.js'

describe('Reports - requires resubmission @requiresResubmission', () => {
  // Reset the shared browser session between tests so leftover auth state does
  // not auto-log-in and skip the stub's user-selection page (see CMA spec).
  afterEach(async () => {
    await browser.reloadSession()
  })

  it('shows a Requires resubmission entry after a summary log restates a closed period @requiresResubmissionStatus @cma', async () => {
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
          regNumber: 'R25SR500040912PA',
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

    const regId = migrationResponse.registrationIds[0]

    // Precondition: a submitted (closed) report for Q1 2026.
    await seedSubmittedReport(
      organisationDetails.refNo,
      regId,
      user.userId,
      2026,
      'quarterly',
      1,
      1,
      { tonnageRecycled: 100, tonnageNotRecycled: 0 }
    )

    await HomePage.open()
    await HomePage.clickStartNow()
    await DefraIdStubPage.loginViaEmail(migrationResponse.email)

    await DashboardPage.selectLink(1)
    await WasteRecordsPage.submitSummaryLogLink()

    // Upload a summary log that restates the closed Q1 2026 period, and confirm
    // it. On submit the backend flags that period's report for resubmission.
    await UploadSummaryLogPage.uploadFile(
      'resources/reprocessor-output-regonly-cma.xlsx'
    )
    await UploadSummaryLogPage.continue()
    await checkBodyText('Your summary log is being checked', 30)
    await checkBodyText('Upload your summary log', 60)
    await checkBodyText('Closed periods: new loads', 30)

    await EnhancedCheckSummaryLogPage.upload()
    await checkBodyText('Your waste records are being updated', 30)
    await checkBodyText('Summary log uploaded', 60)
    await UploadSummaryLogPage.clickOnReturnToHomePage()

    // The Reports landing page now shows a "Requires resubmission" entry for the
    // restated period.
    await DashboardPage.selectLink(1)
    await WasteRecordsPage.manageReportsLink()
    await checkBodyText('Requires resubmission', 30)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
