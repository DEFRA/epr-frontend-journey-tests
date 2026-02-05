import { browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import {
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

async function checkPrnDetails(
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
  expect(
    accreditationDetails['Accreditation address'].replaceAll(', ', ',')
  ).toBe(organisationDetails.regAddresses[0])
  return { prnDetails }
}

async function checkViewPrnDetails(
  organisationDetails,
  issuer,
  tonnageWordings,
  issuerNotes,
  status,
  materialDesc,
  accNumber
) {
  const prnViewDetails = await PrnViewPage.prnDetails()
  expect(prnViewDetails['Issued by']).toBe(
    organisationDetails.organisation.companyName
  )
  expect(prnViewDetails['Buyer']).toBe(issuer)
  expect(prnViewDetails['Tonnage']).toBe(`${tonnageWordings.integer}`)
  expect(prnViewDetails['Issuer notes']).toBe(issuerNotes)
  expect(prnViewDetails['Status']).toBe(status)
  expect(prnViewDetails['December waste']).toBe('No')
  expect(prnViewDetails['Tonnage in words']).toBe(tonnageWordings.word)
  expect(prnViewDetails['Process to be used']).toBe('R3')

  const accreditationViewDetails = await PrnViewPage.accreditationDetails()
  expect(accreditationViewDetails['Material']).toBe(materialDesc)
  expect(accreditationViewDetails['Accreditation number']).toBe(accNumber)
  expect(
    accreditationViewDetails['Accreditation address'].replaceAll(', ', ',')
  ).toBe(organisationDetails.regAddresses[0])
}

async function createAndCheckPrnDetails(
  tonnageWordings,
  producer,
  tradingName,
  issuerNotes,
  issuerNotesToCheck,
  organisationDetails,
  materialDesc,
  accNumber
) {
  await CreatePRNPage.createPrn(tonnageWordings.integer, producer, issuerNotes)
  const headingText = await CheckBeforeCreatingPrnPage.headingText()
  expect(headingText).toBe('Check before creating PRN')
  await checkPrnDetails(
    organisationDetails,
    materialDesc,
    tradingName,
    tonnageWordings,
    issuerNotesToCheck,
    accNumber
  )
}

describe('Issuing Packing Recycling Notes', () => {
  it('Should be able to create and issue PRNs for Paper (Reprocessor Input) @issueprn', async () => {
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

    const tradingName = 'Bigco Packaging Ltd'
    const producer = `${tradingName}, Zig Zag road, Box Hill, Tadworth, KT20 7LB`
    let issuerNotes = ''

    issuerNotes = 'Testing'
    await createAndCheckPrnDetails(
      tonnageWordings,
      producer,
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

    expect(message).toContain('PRN created')
    expect(message).toContain(awaitingAuthorisationStatus)

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
    const awaitingAuthRow =
      await PrnDashboardPage.getAwaitingAuthorisationRow(1)
    expect(awaitingAuthRow.get('Producer or compliance scheme')).toEqual(
      tradingName
    )
    expect(awaitingAuthRow.get('Date created')).toEqual(expectedCreateDate)
    expect(awaitingAuthRow.get('Tonnage')).toEqual(`${tonnageWordings.integer}`)
    expect(awaitingAuthRow.get('Status')).toEqual(awaitingAuthorisationStatus)
    // End of PRN Dashboard checks

    await PrnDashboardPage.selectAwaitingAuthorisationLink(1)
    await checkViewPrnDetails(
      organisationDetails,
      tradingName,
      tonnageWordings,
      issuerNotes,
      awaitingAuthorisationStatus,
      materialDesc,
      accNumber
    )

    await PrnViewPage.returnToPRNList()

    // Issue the created PRN
    await PrnDashboardPage.selectAwaitingAuthorisationLink(1)
    await PrnViewPage.issuePRNButton()

    let prnIssuedText = await PrnIssuedPage.messageText()

    expect(prnIssuedText).toContain('PRN issued to ' + tradingName)
    expect(prnIssuedText).toContain('PRN number:')

    let prnNumber = await PrnIssuedPage.prnNumberText()
    const prnNoPattern = /SR\d{6,8}/
    expect(prnNoPattern.test(prnNumber)).toEqual(true)

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
    await checkViewPrnDetails(
      organisationDetails,
      tradingName,
      tonnageWordings,
      issuerNotes,
      awaitingAcceptanceStatus,
      materialDesc,
      accNumber
    )

    await PrnViewPage.returnToPRNList()

    const noPrnMessage = await PrnDashboardPage.getNoPrnMessage()
    expect(noPrnMessage).toBe('No PRNs or PERNs have been created yet.')

    await PrnDashboardPage.selectBackLink()

    wasteBalanceAmount = await WasteRecordsPage.wasteBalanceAmount()
    expect(wasteBalanceAmount).toBe(expectedWasteBalance + ' tonnes')

    // Create a new PRN
    await WasteRecordsPage.createNewPRNLink()

    const newTradingName = 'Green Waste Solutions'
    const newProducer =
      'Green Waste Solutions, 1 Worlds End Lane, Green St Green, BR6 6AG, England'
    const newTonnageWordings = {
      integer: 19,
      word: 'Nineteen'
    }
    const newIssuerNotes = 'Testing another PRN'

    await createAndCheckPrnDetails(
      newTonnageWordings,
      newProducer,
      newTradingName,
      newIssuerNotes,
      newIssuerNotes,
      organisationDetails,
      materialDesc,
      accNumber
    )

    await CheckBeforeCreatingPrnPage.createPRN()

    const newMessage = await PrnCreatedPage.messageText()

    expect(newMessage).toContain('PRN created')
    expect(message).toContain(awaitingAuthorisationStatus)
    // End of new PRN creation

    await PrnCreatedPage.returnToRegistrationPage()
    await DashboardPage.selectTableLink(1, 1)

    await WasteRecordsPage.managePRNsLink()

    const newAwaitingAuthRow =
      await PrnDashboardPage.getAwaitingAuthorisationRow(1)
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

    await PrnDashboardPage.selectAwaitingAuthorisationLink(1)

    await checkViewPrnDetails(
      organisationDetails,
      newTradingName,
      newTonnageWordings,
      newIssuerNotes,
      awaitingAuthorisationStatus,
      materialDesc,
      accNumber
    )

    await PrnViewPage.issuePRNButton()

    prnIssuedText = await PrnIssuedPage.messageText()

    expect(prnIssuedText).toContain('PRN issued to ' + newTradingName)
    expect(prnIssuedText).toContain('PRN number:')

    prnNumber = await PrnIssuedPage.prnNumberText()
    expect(prnNoPattern.test(prnNumber)).toEqual(true)

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

    // Check Issued PRN details
    await checkViewPrnDetails(
      organisationDetails,
      tradingName,
      tonnageWordings,
      issuerNotes,
      awaitingAcceptanceStatus,
      materialDesc,
      accNumber
    )

    await PrnViewPage.returnToPRNList()
    await PrnDashboardPage.selectBackLink()

    await WasteRecordsPage.selectBackLink()

    const expectedUpdatedWasteBalance = '170.28'
    const availableWasteBalance = await DashboardPage.availableWasteBalance(1)
    expect(availableWasteBalance).toBe(expectedUpdatedWasteBalance)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
