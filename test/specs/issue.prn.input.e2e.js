import { browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import {
  createAndRegisterDefraIdUser,
  createLinkedOrganisation,
  externalAPIcancelPrn,
  linkDefraIdUser,
  updateMigratedOrganisation
} from '../support/apicalls.js'
import CreatePRNPage from 'page-objects/create.prn.page.js'
import CheckBeforeCreatingPrnPage from 'page-objects/check.before.creating.prn.page.js'
import PrnCreatedPage from 'page-objects/prn.created.page.js'
import UploadSummaryLogPage from 'page-objects/upload.summary.log.page.js'
import PrnDashboardPage from 'page-objects/prn.dashboard.page.js'
import PrnViewPage from 'page-objects/prn.view.page.js'
import PrnIssuedPage from 'page-objects/prn.issued.page.js'
import {
  tradingName,
  thirdTradingName as newTradingName,
  thirdTradingName as updatedTradingName
} from '../support/fixtures.js'
import { checkBodyText } from '../support/checks.js'
import ConfirmCancelPrnPage from 'page-objects/confirm.cancel.prn.page.js'
import PrnCancelledPage from 'page-objects/prn.cancelled.page.js'
import { switchToNewTabAndClosePreviousTab } from '../support/windowtabs.js'
import {
  checkViewPrnDetails,
  createAndCheckPrnDetails
} from '../support/prnchecks.js'

describe('Issuing Packing Recycling Notes', () => {
  it('Should be able to create and issue PRNs for Paper (Reprocessor Input) @issueprnrepro', async function () {
    const regNumber = 'R25SR500000912PA'
    const accNumber = 'R-ACC12045PA'

    const materialDesc = 'Paper and board'

    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor' }
    ])

    const userEmail = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'input',
          regNumber,
          accNumber,
          status: 'approved'
        }
      ],
      'sepa'
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
    // Paper and board	392.28
    const expectedWasteBalance = '189.28'

    await DashboardPage.selectTableLink(1, 1)

    await WasteRecordsPage.submitSummaryLogLink()

    const filePath = `resources/sanity/reprocessorInput_${accNumber}_${regNumber}.xlsx`
    await UploadSummaryLogPage.performUploadAndReturnToHomepage(filePath)

    await DashboardPage.selectTableLink(1, 1)

    await WasteRecordsPage.createNewPRNLink()

    let issuerNotes = ''

    issuerNotes = 'Testing'

    const originalWasteBalance = '392.28'
    const wasteBalanceHint = await CreatePRNPage.wasteBalanceHint()
    expect(wasteBalanceHint).toBe(
      `Your waste balance available for creating PRNs is ${originalWasteBalance} tonnes.`
    )

    const prnDetails = {
      tonnageWordings,
      tradingName,
      issuerNotes,
      organisationDetails,
      status: '',
      materialDesc,
      accNumber,
      prnNumber: '',
      issuedDate: ''
    }

    await createAndCheckPrnDetails(prnDetails)

    await CheckBeforeCreatingPrnPage.createPRN()

    const message = await PrnCreatedPage.messageText()

    const awaitingAuthorisationStatus = 'Awaiting authorisation'

    expect(message).toContain('PRN created')
    expect(message).toContain(awaitingAuthorisationStatus)

    checkBodyText('Your available waste balance has been updated.', 10)
    checkBodyText('You can now issue this PRN through your PRNs page.', 10)

    await PrnCreatedPage.returnToRegistrationPage()

    await DashboardPage.selectTableLink(1, 1)

    await WasteRecordsPage.managePRNsLink()

    // PRN Dashboard checks - Waste Balance Amount, Awaiting Authorisation table values
    let wasteBalanceAmount = await PrnDashboardPage.wasteBalanceAmount()

    expect(wasteBalanceAmount).toBe(expectedWasteBalance + ' tonnes')

    // Check cancel hint text
    const cancelHintText = await PrnDashboardPage.cancelHintText()
    expect(cancelHintText).toBe(
      'If you delete or cancel a PRN, its tonnage will be added to your available waste balance.'
    )

    const selectPRNHeadingText = await PrnDashboardPage.selectPrnHeadingText()
    expect(selectPRNHeadingText).toBe('Select a PRN')

    const today = new Date()
    const expectedCreateDate = today.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    const awaitingAuthRow = await PrnDashboardPage.getAwaitingRow(1)
    expect(awaitingAuthRow.get('Producer or compliance scheme')).toEqual(
      tradingName
    )
    expect(awaitingAuthRow.get('Date created')).toEqual(expectedCreateDate)
    expect(awaitingAuthRow.get('Tonnage')).toEqual(`${tonnageWordings.integer}`)
    expect(awaitingAuthRow.get('Status')).toEqual(awaitingAuthorisationStatus)
    // End of PRN Dashboard checks

    await PrnDashboardPage.selectAwaitingLink(1)

    prnDetails.status = awaitingAuthorisationStatus

    await checkViewPrnDetails(prnDetails)

    await PrnViewPage.returnToPRNList()

    // Issue the created PRN
    await PrnDashboardPage.selectAwaitingLink(1)
    await PrnViewPage.issuePRNButton()

    let prnIssuedText = await PrnIssuedPage.messageText()

    expect(prnIssuedText).toContain('PRN issued to ' + tradingName)
    expect(prnIssuedText).toContain('PRN number:')

    const prnNumber = await PrnIssuedPage.prnNumberText()
    const prnNoPattern = /SR\d{5,9}/
    expect(prnNoPattern.test(prnNumber)).toEqual(true)

    await PrnIssuedPage.viewPdfButton()

    await switchToNewTabAndClosePreviousTab()

    const awaitingAcceptanceStatus = 'Awaiting acceptance'

    prnDetails.status = awaitingAcceptanceStatus
    prnDetails.issuedDate = expectedCreateDate
    prnDetails.prnNumber = prnNumber

    await checkViewPrnDetails(prnDetails)

    await PrnViewPage.returnToPRNList()

    const noPrnMessage = await PrnDashboardPage.getNoPrnMessage()
    expect(noPrnMessage).toBe('No PRNs or PERNs have been created yet.')

    await PrnDashboardPage.selectBackLink()

    wasteBalanceAmount = await WasteRecordsPage.wasteBalanceAmount()
    expect(wasteBalanceAmount).toBe(expectedWasteBalance + ' tonnes')

    // Create a new PRN
    await WasteRecordsPage.createNewPRNLink()

    const newTonnageWordings = {
      integer: 19,
      word: 'Nineteen'
    }
    const newIssuerNotes = 'Testing another PRN'

    const newPrnDetails = {
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

    await createAndCheckPrnDetails(newPrnDetails)

    await CheckBeforeCreatingPrnPage.createPRN()

    const newMessage = await PrnCreatedPage.messageText()

    expect(newMessage).toContain('PRN created')
    expect(message).toContain(awaitingAuthorisationStatus)
    // End of new PRN creation

    await PrnCreatedPage.returnToRegistrationPage()
    await DashboardPage.selectTableLink(1, 1)

    await WasteRecordsPage.managePRNsLink()

    const newAwaitingAuthRow = await PrnDashboardPage.getAwaitingRow(1)
    expect(newAwaitingAuthRow.get('Producer or compliance scheme')).toEqual(
      newTradingName
    )
    expect(newAwaitingAuthRow.get('Date created')).toEqual(expectedCreateDate)
    expect(newAwaitingAuthRow.get('Tonnage')).toEqual(
      `${newTonnageWordings.integer}`
    )
    expect(newAwaitingAuthRow.get('Status')).toEqual(
      awaitingAuthorisationStatus
    )

    await PrnDashboardPage.selectAwaitingLink(1)

    newPrnDetails.status = awaitingAuthorisationStatus

    await checkViewPrnDetails(newPrnDetails)

    await PrnViewPage.issuePRNButton()

    prnIssuedText = await PrnIssuedPage.messageText()

    expect(prnIssuedText).toContain('PRN issued to ' + newTradingName)
    expect(prnIssuedText).toContain('PRN number:')

    const secondPrnNumber = await PrnIssuedPage.prnNumberText()
    expect(prnNoPattern.test(secondPrnNumber)).toEqual(true)

    // Both Manage PRNs and Issue another PRN links should point to the same page
    const managePRNsElement = await PrnIssuedPage.managePRNs()
    const issueAnotherPRNElement = await PrnIssuedPage.issueAnotherPRN()
    expect(managePRNsElement.getAttribute('href')).toEqual(
      issueAnotherPRNElement.getAttribute('href')
    )

    await PrnIssuedPage.returnToHomePage()

    await WasteRecordsPage.managePRNsLink()

    // Check issued PRNs
    await PrnDashboardPage.selectIssuedTab()

    const issuedRow = await PrnDashboardPage.getIssuedRow(1)

    const expectedPrnNumber = issuedRow.get('PRN number')
    expect(prnNoPattern.test(expectedPrnNumber)).toEqual(true)
    expect(issuedRow.get('Producer or compliance scheme')).toEqual(tradingName)
    expect(issuedRow.get('Date issued')).toEqual(expectedCreateDate)
    expect(issuedRow.get('Status')).toEqual(awaitingAcceptanceStatus)

    const secondIssuedRow = await PrnDashboardPage.getIssuedRow(2)
    const expectedSecondPrnNumber = secondIssuedRow.get('PRN number')
    expect(prnNoPattern.test(expectedSecondPrnNumber)).toEqual(true)
    expect(secondIssuedRow.get('Producer or compliance scheme')).toEqual(
      newTradingName
    )
    expect(secondIssuedRow.get('Date issued')).toEqual(expectedCreateDate)
    expect(secondIssuedRow.get('Status')).toEqual(awaitingAcceptanceStatus)

    // Check first Issued PRN details
    await PrnDashboardPage.selectIssuedLink(1)

    await switchToNewTabAndClosePreviousTab()

    // Check Issued PRN details
    await checkViewPrnDetails(prnDetails)

    // Now RPD cancels the PRN
    await externalAPIcancelPrn(prnNumber)

    await PrnViewPage.returnToPRNList()

    // See that on the PRN Dashboard page, only PRNs awaiting cancellation are shown
    const tableHeading = await PrnDashboardPage.getTableHeading()
    expect(tableHeading).toBe('PRNs awaiting cancellation')

    const awaitingCancellationStatus = 'Awaiting cancellation'
    let awaitingCancellationRow = await PrnDashboardPage.getAwaitingRow(1)
    expect(
      awaitingCancellationRow.get('Producer or compliance scheme')
    ).toEqual(tradingName)
    expect(awaitingCancellationRow.get('Date created')).toEqual(
      expectedCreateDate
    )
    expect(awaitingCancellationRow.get('Tonnage')).toEqual(
      `${tonnageWordings.integer}`
    )
    expect(awaitingCancellationRow.get('Status')).toEqual(
      awaitingCancellationStatus
    )

    await PrnDashboardPage.selectBackLink()

    // Create another new PRN
    await WasteRecordsPage.createNewPRNLink()

    const updatedTonnageWordings = {
      integer: 15,
      word: 'Fifteen'
    }

    const updatedPrnDetails = {
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

    await createAndCheckPrnDetails(updatedPrnDetails)

    await CheckBeforeCreatingPrnPage.createPRN()

    const updatedMessage = await PrnCreatedPage.messageText()

    expect(updatedMessage).toContain('PRN created')
    expect(message).toContain(awaitingAuthorisationStatus)
    // End of new PRN creation

    await PrnCreatedPage.prnsPageLink()

    // See that on the PRN Dashboard page, PRNs awaiting authorisation and cancellation are shown
    const awaitingAuthHeading = await PrnDashboardPage.getTableHeading()
    expect(awaitingAuthHeading).toBe('PRNs awaiting authorisation')

    // const awaitingCancellationStatus = 'Awaiting cancellation'
    const updatedAwaitingAuthRow = await PrnDashboardPage.getAwaitingRow(1)
    expect(updatedAwaitingAuthRow.get('Producer or compliance scheme')).toEqual(
      updatedTradingName
    )
    expect(updatedAwaitingAuthRow.get('Date created')).toEqual(
      expectedCreateDate
    )
    expect(updatedAwaitingAuthRow.get('Tonnage')).toEqual(
      `${updatedTonnageWordings.integer}`
    )
    expect(updatedAwaitingAuthRow.get('Status')).toEqual(
      awaitingAuthorisationStatus
    )

    const awaitingCancellationHeading =
      await PrnDashboardPage.getTableHeading(2)
    expect(awaitingCancellationHeading).toBe('PRNs awaiting cancellation')

    awaitingCancellationRow = await PrnDashboardPage.getAwaitingRow(1, 2)
    expect(
      awaitingCancellationRow.get('Producer or compliance scheme')
    ).toEqual(tradingName)
    expect(awaitingCancellationRow.get('Date created')).toEqual(
      expectedCreateDate
    )
    expect(awaitingCancellationRow.get('Tonnage')).toEqual(
      `${tonnageWordings.integer}`
    )
    expect(awaitingCancellationRow.get('Status')).toEqual(
      awaitingCancellationStatus
    )

    // Select awaiting cancellation PRN
    await PrnDashboardPage.selectAwaitingLink(1, 2)

    prnDetails.status = awaitingCancellationStatus

    await checkViewPrnDetails(prnDetails)

    // Test back link of cancellation page
    await PrnViewPage.cancelPRNButton()

    let confirmCancelHeading = await ConfirmCancelPrnPage.headingText()
    expect(confirmCancelHeading).toBe('Confirm cancellation of this PRN')
    await ConfirmCancelPrnPage.selectBackLink()

    // Now cancel the PRN and return to PRN Dashboard page
    await PrnViewPage.cancelPRNButton()
    confirmCancelHeading = await ConfirmCancelPrnPage.headingText()
    expect(confirmCancelHeading).toBe('Confirm cancellation of this PRN')

    await ConfirmCancelPrnPage.confirmCancelPrn()

    const cancelledMessageText = await PrnCancelledPage.messageText()
    expect(cancelledMessageText).toContain('PRN cancelled')

    const prnStatus = await PrnCancelledPage.statusText()
    expect(prnStatus).toContain('Cancelled')

    await PrnCancelledPage.prnsPage()
    // End of PRN cancellation test

    await PrnDashboardPage.selectBackLink()

    await WasteRecordsPage.selectBackLink()

    // Check that the waste balance has been updated from the cancelled PRN
    const expectedUpdatedWasteBalance = '358.28'
    const availableWasteBalance = await DashboardPage.availableWasteBalance(1)
    expect(availableWasteBalance).toBe(expectedUpdatedWasteBalance)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
