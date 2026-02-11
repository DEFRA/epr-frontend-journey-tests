import { browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import {
  externalAPIcancelPrn,
  createAndRegisterDefraIdUser,
  createLinkedOrganisation,
  linkDefraIdUser,
  updateMigratedOrganisation
} from '../support/apicalls.js'
import CreatePRNPage from 'page-objects/create.prn.page.js'
import PrnCreatedPage from 'page-objects/prn.created.page.js'
import UploadSummaryLogPage from 'page-objects/upload.summary.log.page.js'
import PrnDashboardPage from 'page-objects/prn.dashboard.page.js'
import PrnViewPage from 'page-objects/prn.view.page.js'
import PrnIssuedPage from 'page-objects/prn.issued.page.js'
import {
  tradingName,
  secondTradingName as newTradingName,
  thirdTradingName as updatedTradingName
} from '../support/fixtures.js'
import { checkBodyText } from '../support/checks.js'
import ConfirmCancelPrnPage from 'page-objects/confirm.cancel.prn.page.js'
import { switchToNewTabAndClosePreviousTab } from '../support/windowtabs.js'
import {
  cancelPRNAndReturnToPRNsDashboard,
  checkAwaitingRows,
  checkIssuedPageLinks,
  checkIssuedRows,
  checkViewPrnDetails,
  createAndCheckPrnDetails,
  issuePrnAndUpdateDetails
} from '../support/prnchecks.js'
import { todayddMMMMyyyy } from '../support/date.js'

describe('Issuing Packing Recycling Notes (Exporter)', () => {
  it('Should be able to create and issue PRNs for Wood (Exporter) @issueprnexp', async function () {
    const regNumber = 'E25SR500020912WO'
    const accNumber = 'E-ACC12245WO'

    const materialDesc = 'Wood'

    const organisationDetails = await createLinkedOrganisation([
      { material: 'Wood (R3)', wasteProcessingType: 'Exporter' }
    ])

    const userEmail = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          regNumber,
          accNumber,
          status: 'approved'
        }
      ]
    )

    const user = await createAndRegisterDefraIdUser(userEmail)
    await linkDefraIdUser(organisationDetails.refNo, user.userId, userEmail)

    await HomePage.openStart()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(userEmail)

    const tonnageWordings = {
      integer: 203,
      word: 'Two hundred and three'
    }

    // Tonnage value expected from Summary Log files upload
    // Wood
    const expectedWasteBalance = '371,647.05'

    await DashboardPage.selectTableLink(1, 1)

    await WasteRecordsPage.submitSummaryLogLink()

    const filePath = `resources/sanity/exporter_${accNumber}_${regNumber}.xlsx`
    await UploadSummaryLogPage.performUploadAndReturnToHomepage(filePath)

    await DashboardPage.selectTableLink(1, 1)

    await WasteRecordsPage.createNewPERNLink()

    const originalWasteBalance = '371,850.05'
    const wasteBalanceHint = await CreatePRNPage.wasteBalanceHint()
    expect(wasteBalanceHint).toBe(
      `Your waste balance available for creating PERNs is ${originalWasteBalance} tonnes.`
    )

    const pernDetails = {
      tonnageWordings,
      tradingName,
      issuerNotes: 'Testing',
      organisationDetails,
      status: '',
      materialDesc,
      accNumber,
      prnNumber: '',
      issuedDate: '',
      createdDate: todayddMMMMyyyy
    }

    await createAndCheckPrnDetails(pernDetails, true)

    await checkBodyText('Your available waste balance has been updated.', 10)
    await checkBodyText(
      'You can now issue this PERN through your PERNs page.',
      10
    )

    await PrnCreatedPage.returnToRegistrationPage()
    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.managePERNsLink()

    // PRN Dashboard checks - Waste Balance Amount, Awaiting Authorisation table values
    let wasteBalanceAmount = await PrnDashboardPage.wasteBalanceAmount()
    expect(wasteBalanceAmount).toBe(expectedWasteBalance + ' tonnes')

    // Check cancel hint text
    const cancelHintText = await PrnDashboardPage.cancelHintText()
    expect(cancelHintText).toBe(
      'If you delete or cancel a PERN, its tonnage will be added to your available waste balance.'
    )
    const selectPERNHeadingText = await PrnDashboardPage.selectPrnHeadingText()
    expect(selectPERNHeadingText).toBe('Select a PERN')

    await checkAwaitingRows(pernDetails, 1)
    // End of PRN Dashboard checks

    await PrnDashboardPage.selectAwaitingLink(1)
    await checkViewPrnDetails(pernDetails, true)
    await PrnViewPage.returnToPERNList()

    // Issue the created PERN
    await PrnDashboardPage.selectAwaitingLink(1)
    await issuePrnAndUpdateDetails(pernDetails, 'EX', true)

    await PrnIssuedPage.viewPdfButton()
    await switchToNewTabAndClosePreviousTab()

    await checkViewPrnDetails(pernDetails, true)

    await PrnViewPage.returnToPERNList()

    const noPrnMessage = await PrnDashboardPage.getNoPrnMessage()
    expect(noPrnMessage).toBe('No PRNs or PERNs have been created yet.')

    await PrnDashboardPage.selectBackLink()

    wasteBalanceAmount = await WasteRecordsPage.wasteBalanceAmount()
    expect(wasteBalanceAmount).toBe(expectedWasteBalance + ' tonnes')

    // Create a new PERN
    await WasteRecordsPage.createNewPERNLink()

    const newTonnageWordings = {
      integer: 19,
      word: 'Nineteen'
    }
    const newIssuerNotes = 'Testing another PERN'

    const newPernDetails = {
      tonnageWordings: newTonnageWordings,
      tradingName: newTradingName,
      issuerNotes: newIssuerNotes,
      organisationDetails,
      status: '',
      materialDesc,
      accNumber,
      prnNumber: '',
      issuedDate: ''
    }

    await createAndCheckPrnDetails(newPernDetails, true)
    // End of new PERN creation

    await PrnCreatedPage.returnToRegistrationPage()
    await DashboardPage.selectTableLink(1, 1)

    await WasteRecordsPage.managePERNsLink()

    await checkAwaitingRows(newPernDetails, 1)

    await PrnDashboardPage.selectAwaitingLink(1)

    await checkViewPrnDetails(newPernDetails, true)

    await issuePrnAndUpdateDetails(newPernDetails, 'EX', true)
    await checkIssuedPageLinks()

    await PrnIssuedPage.returnToHomePage()
    await WasteRecordsPage.managePERNsLink()

    // Check issued PERNs
    await PrnDashboardPage.selectIssuedTab()
    await checkIssuedRows(pernDetails, 1, true)
    await checkIssuedRows(newPernDetails, 2, true)

    // Check first Issued PRN details
    await PrnDashboardPage.selectIssuedLink(1)
    await switchToNewTabAndClosePreviousTab()

    // Check Issued PERN details
    await checkViewPrnDetails(pernDetails, true)

    // Now RPD cancels the PERN
    await externalAPIcancelPrn(pernDetails)

    await PrnViewPage.returnToPERNList()

    // See that on the PRN Dashboard page, only PERNs awaiting cancellation are shown
    const tableHeading = await PrnDashboardPage.getTableHeading()
    expect(tableHeading).toBe('PERNs awaiting cancellation')
    await checkAwaitingRows(pernDetails, 1)

    await PrnDashboardPage.selectBackLink()

    // Create another new PERN
    await WasteRecordsPage.createNewPERNLink()

    const updatedTonnageWordings = {
      integer: 15,
      word: 'Fifteen'
    }

    const updatedPernDetails = {
      tonnageWordings: updatedTonnageWordings,
      tradingName: updatedTradingName,
      issuerNotes: newIssuerNotes,
      status: '',
      organisationDetails,
      materialDesc,
      accNumber,
      prnNumber: '',
      issuedDate: ''
    }

    await createAndCheckPrnDetails(updatedPernDetails, true)
    // End of new PERN creation

    await PrnCreatedPage.pernsPageLink()

    // See that on the PRN Dashboard page, PERNs awaiting authorisation and cancellation are shown
    const awaitingAuthHeading = await PrnDashboardPage.getTableHeading()
    expect(awaitingAuthHeading).toBe('PERNs awaiting authorisation')

    await checkAwaitingRows(updatedPernDetails, 1)

    const awaitingCancellationHeading =
      await PrnDashboardPage.getTableHeading(2)
    expect(awaitingCancellationHeading).toBe('PERNs awaiting cancellation')
    await checkAwaitingRows(pernDetails, 1, 2)

    // Select awaiting cancellation PRN
    await PrnDashboardPage.selectAwaitingLink(1, 2)

    await checkViewPrnDetails(pernDetails, true)

    // Test back link of cancellation page
    await PrnViewPage.cancelPRNButton()

    const confirmCancelHeading = await ConfirmCancelPrnPage.headingText()
    expect(confirmCancelHeading).toBe('Confirm cancellation of this PERN')
    await ConfirmCancelPrnPage.selectBackLink()

    // Now cancel the PRN and return to PRN Dashboard page
    await cancelPRNAndReturnToPRNsDashboard(true)

    // End of PERN cancellation test

    await PrnDashboardPage.selectBackLink()
    await WasteRecordsPage.selectBackLink()

    // Check that the waste balance has been updated from the cancelled PRN
    const expectedUpdatedWasteBalance = '371,816.05'
    const availableWasteBalance = await DashboardPage.availableWasteBalance(1)
    expect(availableWasteBalance).toBe(expectedUpdatedWasteBalance)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
