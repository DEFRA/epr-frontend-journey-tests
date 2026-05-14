import { browser, expect } from '@wdio/globals'
import AccountLinkingPage from '../page-objects/account.linking.page.js'
import CheckBeforeCreatingPrnPage from 'page-objects/check.before.creating.prn.page.js'
import ConfirmCancelPrnPage from 'page-objects/confirm.cancel.prn.page.js'
import ConfirmDeletePRNPage from 'page-objects/confirm.delete.prn.page.js'
import ConfirmDeleteReportPage from '../page-objects/confirm.delete.report.page.js'
import ConfirmDiscardPRNPage from 'page-objects/confirm.discard.prn.page.js'
import CreatePRNPage from 'page-objects/create.prn.page.js'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import PrnCancelledPage from 'page-objects/prn.cancelled.page.js'
import PrnCreatedPage from 'page-objects/prn.created.page.js'
import PrnDashboardPage from 'page-objects/prn.dashboard.page.js'
import PrnIssuedPage from 'page-objects/prn.issued.page.js'
import PrnViewPage from 'page-objects/prn.view.page.js'
import ConfirmationPage from 'page-objects/reports/confirmation.page.js'
import FreePrnsPage from '../page-objects/reports/free.prns.page.js'
import MonthlyReportDraftDeclarationPage from 'page-objects/reports/monthly.report.draft.declaration.page.js'
import ReportCheckAnswersPage from 'page-objects/reports/report.check.answers.page.js'
import ReportDetailPage from 'page-objects/reports/report.detail.page.js'
import ReportSupportingInformationPage from 'page-objects/reports/report.supporting.information.page.js'
import ReprocessorPrnSummaryPage from '../page-objects/reports/reprocessor.prn.summary.page.js'
import ReportsPage from 'page-objects/reports/reports.page.js'
import TonnesNotRecycledPage from '../page-objects/reports/tonnes.not.recycled.page.js'
import TonnesRecycledPage from '../page-objects/reports/tonnes.recycled.page.js'
import UploadSummaryLogPage from 'page-objects/upload.summary.log.page.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import {
  createAndRegisterDefraIdUser,
  createLinkedOrganisation,
  externalAPICancelPrn,
  linkDefraIdUser,
  updateMigratedOrganisation
} from '../support/apicalls.js'
import { checkBodyText } from '../support/checks.js'
import { tonnageWordings, tradingName } from '../support/fixtures.js'

const prnRegNumber = 'R25SR500000912PA'
const prnAccNumber = 'R-ACC12045PA'

const reportRegNumber = 'R25SR500010912PL'
const reportAccNumber = 'R-ACC12145PL'

describe('Double-click prevention on PRN action buttons', () => {
  it('Should prevent double submission on discard PRN and create PRN submit buttons @doubleclick', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor' }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'input',
          regNumber: prnRegNumber,
          accNumber: prnAccNumber,
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

    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.createNewPRNLink()

    await CreatePRNPage.createPrn(
      tonnageWordings.integer,
      tradingName,
      'Testing'
    )
    await CheckBeforeCreatingPrnPage.discardAndStartAgain()
    await ConfirmDiscardPRNPage.discardAndCheckDoubleClickPrevented()

    await CreatePRNPage.submitAndCheckDoubleClickPrevented()

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('Should prevent double submission on summary log confirm, issue, cancel, and delete PRN buttons @doubleclick', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor' }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'input',
          regNumber: prnRegNumber,
          accNumber: prnAccNumber,
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

    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.submitSummaryLogLink()

    const filePath = `resources/sanity/reprocessorInput_${prnAccNumber}_${prnRegNumber}.xlsx`
    await UploadSummaryLogPage.uploadFile(filePath)
    await UploadSummaryLogPage.continue()
    await checkBodyText('Check before confirming upload', 60)
    await UploadSummaryLogPage.confirmAndCheckDoubleClickPrevented()
    await checkBodyText('Summary log uploaded', 60)
    await UploadSummaryLogPage.clickOnReturnToHomePage()

    // Issue PRN button
    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.createNewPRNLink()
    await CreatePRNPage.createPrn(
      tonnageWordings.integer,
      tradingName,
      'Testing'
    )
    await CheckBeforeCreatingPrnPage.createPRN()
    await PrnCreatedPage.prnsPageLink()
    await PrnDashboardPage.selectAwaitingLink(1)
    await PrnViewPage.issueAndCheckDoubleClickPrevented()

    // Cancel PRN button - PRN is awaiting acceptance; external API moves it to awaiting cancellation
    const prnNumber = await PrnIssuedPage.prnNumberText()
    await externalAPICancelPrn({ prnNumber })
    const managePrnsEl = await PrnIssuedPage.managePRNs()
    await managePrnsEl.click()
    await PrnDashboardPage.selectAwaitingLink(1)
    await PrnViewPage.cancelPRNButton()
    await ConfirmCancelPrnPage.confirmCancelAndCheckDoubleClickPrevented()

    // Delete PRN button (requires a fresh PRN in awaiting authorisation state)
    await PrnCancelledPage.prnsPage()
    await PrnDashboardPage.selectBackLink()
    await WasteRecordsPage.createNewPRNLink()
    await CreatePRNPage.createPrn(
      tonnageWordings.integer,
      tradingName,
      'Testing'
    )
    await CheckBeforeCreatingPrnPage.createPRN()
    await PrnCreatedPage.prnsPageLink()
    await PrnDashboardPage.selectAwaitingLink(1)
    await PrnViewPage.deletePRNButton()
    await ConfirmDeletePRNPage.deletePrnAndCheckDoubleClickPrevented()

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('Should prevent double submission on use this data, confirm delete report, create report, and submit report buttons @doubleclick', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Plastic (R3)', wasteProcessingType: 'Reprocessor' }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: reportRegNumber,
          accNumber: reportAccNumber,
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

    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.submitSummaryLogLink()

    const filePath = `resources/sanity/reprocessorOutput_${reportAccNumber}_${reportRegNumber}.xlsx`
    await UploadSummaryLogPage.performUploadAndReturnToHomepage(filePath)

    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.manageReportsLink()

    // Use this data button
    await ReportsPage.selectActionLink(1)
    await ReportDetailPage.useThisDataAndCheckDoubleClickPrevented()

    // Fill report wizard
    await TonnesRecycledPage.enterTonnage('10')
    await TonnesRecycledPage.continue()
    await TonnesNotRecycledPage.enterTonnage('5')
    await TonnesNotRecycledPage.continue()
    await ReprocessorPrnSummaryPage.enterRevenue('100')
    await ReprocessorPrnSummaryPage.continue()
    await FreePrnsPage.enterTonnage('0')
    await FreePrnsPage.continue()

    // Confirm delete report button — delete from supporting information page
    await ReportSupportingInformationPage.deleteReportLink()
    await ConfirmDeleteReportPage.confirmDeletionAndCheckDoubleClickPrevented()

    // Restart the wizard for create report and submit report tests
    await ReportsPage.selectActionLink(1)
    await ReportDetailPage.useThisData()
    await TonnesRecycledPage.enterTonnage('10')
    await TonnesRecycledPage.continue()
    await TonnesNotRecycledPage.enterTonnage('5')
    await TonnesNotRecycledPage.continue()
    await ReprocessorPrnSummaryPage.enterRevenue('100')
    await ReprocessorPrnSummaryPage.continue()
    await FreePrnsPage.enterTonnage('0')
    await FreePrnsPage.continue()
    await ReportSupportingInformationPage.continue()

    // Create report button
    await ReportCheckAnswersPage.createReportAndCheckDoubleClickPrevented()

    // Submit report button
    await ConfirmationPage.goToReports()
    await ReportsPage.selectActionLink(1)
    await MonthlyReportDraftDeclarationPage.submitAndCheckDoubleClickPrevented()

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('Should prevent double submission on the confirm account link button @doubleclick', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor' }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'input',
          regNumber: prnRegNumber,
          accNumber: prnAccNumber,
          status: 'approved'
        }
      ]
    )

    await createAndRegisterDefraIdUser(migrationResponse.email, 2)

    await HomePage.openStart()
    await HomePage.clickStartNow()
    await DefraIdStubPage.loginViaEmail(migrationResponse.email)
    await DefraIdStubPage.selectOrganisation(1)

    // Confirm account link button
    await AccountLinkingPage.selectOrganisation()
    await AccountLinkingPage.confirmLinkAndCheckDoubleClickPrevented()

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
