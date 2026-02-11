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
import CheckBeforeCreatingPrnPage from 'page-objects/check.before.creating.prn.page.js'
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
import PrnCancelledPage from 'page-objects/prn.cancelled.page.js'

async function checkPernDetails(
  organisationDetails,
  materialDesc,
  tradingName,
  tonnageWordings,
  issuerNotes,
  accNumber
) {
  const prnDetails = await CheckBeforeCreatingPrnPage.prnDetails()
  expect(prnDetails['Issuer']).toBe(
    organisationDetails.organisation.companyName
  )
  expect(prnDetails['Packaging waste producer or compliance scheme']).toBe(
    tradingName
  )
  expect(prnDetails['Tonnage']).toBe(`${tonnageWordings.integer}`)
  expect(prnDetails['Tonnage in words']).toBe(tonnageWordings.word)
  expect(prnDetails['Process to be used']).toBe('R3')
  expect(prnDetails['Issuer notes']).toBe(issuerNotes)

  const accreditationDetails =
    await CheckBeforeCreatingPrnPage.accreditationDetails()

  expect(accreditationDetails['Material']).toBe(materialDesc)
  expect(accreditationDetails['Accreditation number']).toBe(accNumber)
  return { prnDetails }
}

async function checkViewPernDetails(
  organisationDetails,
  issuer,
  tonnageWordings,
  issuerNotes,
  status,
  materialDesc,
  accNumber,
  prnNumber,
  issuedDate = ''
) {
  const headingText = await PrnViewPage.headingText()
  expect(headingText).toBe('Packaging Waste Export Recycling Note')

  const prnViewDetails = await PrnViewPage.prnDetails()

  expect(prnViewDetails['PERN number']).toBe(prnNumber)
  expect(prnViewDetails['Packaging waste producer or compliance scheme']).toBe(
    issuer
  )
  expect(prnViewDetails['Tonnage']).toBe(`${tonnageWordings.integer}`)
  expect(prnViewDetails['Issuer notes']).toBe(issuerNotes)
  expect(prnViewDetails['Issued date']).toBe(issuedDate)
  expect(prnViewDetails['Status']).toBe(status)
  expect(prnViewDetails['December waste']).toBe('No')
  expect(prnViewDetails['Tonnage in words']).toBe(tonnageWordings.word)
  expect(prnViewDetails['Process to be used']).toBe('R3')

  const accreditationViewDetails = await PrnViewPage.accreditationDetails()
  expect(accreditationViewDetails['Material']).toBe(materialDesc)
  expect(accreditationViewDetails['Accreditation number']).toBe(accNumber)
}

async function createAndCheckPernDetails(
  tonnageWordings,
  tradingName,
  issuerNotes,
  issuerNotesToCheck,
  organisationDetails,
  materialDesc,
  accNumber
) {
  await CreatePRNPage.createPrn(
    tonnageWordings.integer,
    tradingName,
    issuerNotes
  )
  const headingText = await CheckBeforeCreatingPrnPage.headingText()
  expect(headingText).toBe('Check before creating PERN')
  await checkPernDetails(
    organisationDetails,
    materialDesc,
    tradingName,
    tonnageWordings,
    issuerNotesToCheck,
    accNumber
  )
}

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

    let issuerNotes = ''

    issuerNotes = 'Testing'

    const originalWasteBalance = '371,850.05'
    const wasteBalanceHint = await CreatePRNPage.wasteBalanceHint()
    expect(wasteBalanceHint).toBe(
      `Your waste balance available for creating PERNs is ${originalWasteBalance} tonnes.`
    )

    await createAndCheckPernDetails(
      tonnageWordings,
      tradingName,
      issuerNotes,
      issuerNotes,
      organisationDetails,
      materialDesc,
      accNumber
    )

    await CheckBeforeCreatingPrnPage.createPRN()

    const message = await PrnCreatedPage.messageText()

    const awaitingAuthorisationStatus = 'Awaiting authorisation'

    expect(message).toContain('PERN created')
    expect(message).toContain(awaitingAuthorisationStatus)

    checkBodyText('Your available waste balance has been updated.', 10)
    checkBodyText('You can now issue this PERN through your PERNs page.', 10)

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
    await checkViewPernDetails(
      organisationDetails,
      tradingName,
      tonnageWordings,
      issuerNotes,
      awaitingAuthorisationStatus,
      materialDesc,
      accNumber,
      ''
    )

    await PrnViewPage.returnToPERNList()

    // Issue the created PERN
    await PrnDashboardPage.selectAwaitingLink(1)
    await PrnViewPage.issuePRNButton()

    let prnIssuedText = await PrnIssuedPage.messageText()

    expect(prnIssuedText).toContain('PERN issued to ' + tradingName)
    expect(prnIssuedText).toContain('PERN number:')

    const prnNumber = await PrnIssuedPage.prnNumberText()
    const pernNoPattern = /EX\d{5,9}/
    expect(pernNoPattern.test(prnNumber)).toEqual(true)

    let originalWindow = await browser.getWindowHandle()

    await PrnIssuedPage.viewPdfButton()

    await browser.waitUntil(
      async () => (await browser.getWindowHandles()).length === 2,
      { timeout: 5000, timeoutMsg: 'New tab did not open' }
    )

    let handles = await browser.getWindowHandles()
    let newWindow = handles.find((handle) => handle !== originalWindow)
    await browser.switchToWindow(newWindow)

    // Now switch back to original tab to close it
    await browser.switchToWindow(originalWindow)
    await browser.closeWindow()

    // Switch back to the new tab (now the only one)
    await browser.switchToWindow(newWindow)

    const awaitingAcceptanceStatus = 'Awaiting acceptance'
    await checkViewPernDetails(
      organisationDetails,
      tradingName,
      tonnageWordings,
      issuerNotes,
      awaitingAcceptanceStatus,
      materialDesc,
      accNumber,
      prnNumber,
      expectedCreateDate
    )

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

    await createAndCheckPernDetails(
      newTonnageWordings,
      newTradingName,
      newIssuerNotes,
      newIssuerNotes,
      organisationDetails,
      materialDesc,
      accNumber
    )

    await CheckBeforeCreatingPrnPage.createPRN()

    const newMessage = await PrnCreatedPage.messageText()

    expect(newMessage).toContain('PERN created')
    expect(message).toContain(awaitingAuthorisationStatus)
    // End of new PERN creation

    await PrnCreatedPage.returnToRegistrationPage()
    await DashboardPage.selectTableLink(1, 1)

    await WasteRecordsPage.managePERNsLink()

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

    await checkViewPernDetails(
      organisationDetails,
      newTradingName,
      newTonnageWordings,
      newIssuerNotes,
      awaitingAuthorisationStatus,
      materialDesc,
      accNumber,
      ''
    )

    await PrnViewPage.issuePRNButton()

    prnIssuedText = await PrnIssuedPage.messageText()

    expect(prnIssuedText).toContain('PERN issued to ' + newTradingName)
    expect(prnIssuedText).toContain('PERN number:')

    const secondPrnNumber = await PrnIssuedPage.prnNumberText()
    expect(pernNoPattern.test(secondPrnNumber)).toEqual(true)

    // Both Manage PRNs and Issue another PRN links should point to the same page
    const managePRNsElement = await PrnIssuedPage.managePRNs()
    const issueAnotherPRNElement = await PrnIssuedPage.issueAnotherPRN()
    expect(managePRNsElement.getAttribute('href')).toEqual(
      issueAnotherPRNElement.getAttribute('href')
    )

    await PrnIssuedPage.returnToHomePage()

    await WasteRecordsPage.managePERNsLink()

    // Check issued PERNs
    await PrnDashboardPage.selectIssuedTab()

    const issuedRow = await PrnDashboardPage.getIssuedRow(1)

    const expectedPernNumber = issuedRow.get('PERN number')
    expect(pernNoPattern.test(expectedPernNumber)).toEqual(true)
    expect(issuedRow.get('Producer or compliance scheme')).toEqual(tradingName)
    expect(issuedRow.get('Date issued')).toEqual(expectedCreateDate)
    expect(issuedRow.get('Status')).toEqual(awaitingAcceptanceStatus)

    const secondIssuedRow = await PrnDashboardPage.getIssuedRow(2)
    const expectedSecondPrnNumber = secondIssuedRow.get('PERN number')
    expect(pernNoPattern.test(expectedSecondPrnNumber)).toEqual(true)
    expect(secondIssuedRow.get('Producer or compliance scheme')).toEqual(
      newTradingName
    )
    expect(secondIssuedRow.get('Date issued')).toEqual(expectedCreateDate)
    expect(secondIssuedRow.get('Status')).toEqual(awaitingAcceptanceStatus)

    originalWindow = await browser.getWindowHandle()

    // Check first Issued PRN details
    await PrnDashboardPage.selectIssuedLink(1)

    await browser.waitUntil(
      async () => (await browser.getWindowHandles()).length === 2,
      { timeout: 5000, timeoutMsg: 'New tab did not open' }
    )

    handles = await browser.getWindowHandles()
    newWindow = handles.find((handle) => handle !== originalWindow)
    await browser.switchToWindow(newWindow)

    // Now switch back to original tab to close it
    await browser.switchToWindow(originalWindow)
    await browser.closeWindow()

    // Switch back to the new tab (now the only one)
    await browser.switchToWindow(newWindow)

    // Check Issued PERN details
    await checkViewPernDetails(
      organisationDetails,
      tradingName,
      tonnageWordings,
      issuerNotes,
      awaitingAcceptanceStatus,
      materialDesc,
      accNumber,
      prnNumber,
      expectedCreateDate
    )

    // Now RPD cancels the PRN
    await externalAPIcancelPrn(prnNumber)

    await PrnViewPage.returnToPERNList()

    // See that on the PRN Dashboard page, only PERNs awaiting cancellation are shown
    const tableHeading = await PrnDashboardPage.getTableHeading()
    expect(tableHeading).toBe('PERNs awaiting cancellation')

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

    // Create another new PERN
    await WasteRecordsPage.createNewPERNLink()

    const updatedTonnageWordings = {
      integer: 15,
      word: 'Fifteen'
    }

    await createAndCheckPernDetails(
      updatedTonnageWordings,
      updatedTradingName,
      newIssuerNotes,
      newIssuerNotes,
      organisationDetails,
      materialDesc,
      accNumber
    )

    await CheckBeforeCreatingPrnPage.createPRN()

    const updatedMessage = await PrnCreatedPage.messageText()

    expect(updatedMessage).toContain('PERN created')
    expect(message).toContain(awaitingAuthorisationStatus)
    // End of new PERN creation

    await PrnCreatedPage.pernsPageLink()

    // See that on the PRN Dashboard page, PERNs awaiting authorisation and cancellation are shown
    const awaitingAuthHeading = await PrnDashboardPage.getTableHeading()
    expect(awaitingAuthHeading).toBe('PERNs awaiting authorisation')

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
    expect(awaitingCancellationHeading).toBe('PERNs awaiting cancellation')

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

    await checkViewPernDetails(
      organisationDetails,
      tradingName,
      tonnageWordings,
      issuerNotes,
      awaitingCancellationStatus,
      materialDesc,
      accNumber,
      prnNumber,
      expectedCreateDate
    )

    // Test back link of cancellation page
    await PrnViewPage.cancelPRNButton()

    let confirmCancelHeading = await ConfirmCancelPrnPage.headingText()
    expect(confirmCancelHeading).toBe('Confirm cancellation of this PERN')
    await ConfirmCancelPrnPage.selectBackLink()

    // Now cancel the PRN and return to PRN Dashboard page
    await PrnViewPage.cancelPRNButton()
    confirmCancelHeading = await ConfirmCancelPrnPage.headingText()
    expect(confirmCancelHeading).toBe('Confirm cancellation of this PERN')

    await ConfirmCancelPrnPage.confirmCancelPrn()

    const cancelledMessageText = await PrnCancelledPage.messageText()
    expect(cancelledMessageText).toContain('PERN cancelled')

    const prnStatus = await PrnCancelledPage.statusText()
    expect(prnStatus).toContain('Cancelled')

    await PrnCancelledPage.pernsPage()
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
