import { $, browser, expect } from '@wdio/globals'
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
import { checkBodyText } from '../support/checks.js'
import PrnDashboardPage from 'page-objects/prn.dashboard.page.js'
import PrnViewPage from 'page-objects/prn.view.page.js'
import PrnIssuedPage from 'page-objects/prn.issued.page.js'
import ConfirmDiscardPRNPage from 'page-objects/confirm.discard.prn.page.js'

async function checkPrnDetails(
  organisationDetails,
  materialDesc,
  producer,
  tonnageWordings,
  issuerNotes,
  accNumber
) {
  const prnDetails = await CheckBeforeCreatingPrnPage.prnDetails()
  expect(prnDetails['Issuer']).toBe(
    organisationDetails.organisation.companyName
  )
  expect(prnDetails['Packaging waste producer or compliance scheme']).toBe(
    producer
  )
  expect(prnDetails['Tonnage']).toBe(`${tonnageWordings.integer}`)
  //TODO: Fix this?
  // expect(prnDetails['Tonnage in words']).toBe(tonnageWordings.word)
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
  //TODO: Fix this?
  // expect(prnViewDetails['Tonnage in words']).toBe(tonnageWordings.word)
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
  issuerNotes,
  issuerNotesToCheck,
  organisationDetails,
  materialDesc,
  accNumber
) {
  await CreatePRNPage.enterTonnage(tonnageWordings.integer)
  await CreatePRNPage.select(producer)
  await CreatePRNPage.addIssuerNotes(issuerNotes)
  await CreatePRNPage.continue()

  const headingText = await CheckBeforeCreatingPrnPage.headingText()
  expect(headingText).toBe('Check before creating PRN')
  await checkPrnDetails(
    organisationDetails,
    materialDesc,
    producer,
    tonnageWordings,
    issuerNotesToCheck,
    accNumber
  )
}

async function performSummaryLogUpload(accNumber, regNumber) {
  await UploadSummaryLogPage.uploadFile(
    `resources/sanity/reprocessorInput_${accNumber}_${regNumber}.xlsx`
  )
  await UploadSummaryLogPage.continue()

  await checkBodyText('Your file is being checked', 30)
  await checkBodyText('Check before confirming upload', 30)
  await UploadSummaryLogPage.confirmAndSubmit()

  await checkBodyText('Your waste records are being updated', 30)
  await checkBodyText('Summary log uploaded', 30)
  await UploadSummaryLogPage.clickOnReturnToHomePage()
}

describe('Lumpy Packing Recycling Notes', () => {
  it('Should be able to create and manage PRNs for Paper (Reprocessor Input) @lumpyprn', async () => {
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
      ]
    )

    const user = await createAndRegisterDefraIdUser(userEmail)
    await linkDefraIdUser(organisationDetails.refNo, user.userId, userEmail)

    await HomePage.openStart()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(userEmail)

    const tonnageWordings = {
      integer: 203,
      word: 'Two Hundred Three'
    }

    // Tonnage value expected from Summary Log files upload
    // Paper and board	392.28
    const expectedWasteBalance = '189.28'

    await DashboardPage.selectTableLink(1, 1)

    const regNo = await $(`//a[normalize-space()="${regNumber}"]`)
    expect(regNo).toExist()

    const accNo = await $(`//a[normalize-space()="${accNumber}"]`)
    expect(accNo).toExist()

    await WasteRecordsPage.submitSummaryLogLink()

    await performSummaryLogUpload(accNumber, regNumber)

    await DashboardPage.selectTableLink(1, 1)

    let prnLink = await WasteRecordsPage.createNewPRNLink()
    await prnLink.click()

    const producer = 'EcoRecycle Industries'
    let issuerNotes = ''

    // Empty issuer notes, PRN created should say "Not provided"
    await createAndCheckPrnDetails(
      tonnageWordings,
      producer,
      issuerNotes,
      'Not provided',
      organisationDetails,
      materialDesc,
      accNumber
    )
    // Discard the first attempt
    await CheckBeforeCreatingPrnPage.discardAndStartAgain()
    const discardHeading = await ConfirmDiscardPRNPage.headingText()
    expect(discardHeading).toBe('Are you sure you want to discard this PRN?')
    await ConfirmDiscardPRNPage.discardAndStartAgain()

    issuerNotes = 'Testing'
    await createAndCheckPrnDetails(
      tonnageWordings,
      producer,
      issuerNotes,
      issuerNotes,
      organisationDetails,
      materialDesc,
      accNumber
    )

    // This time we go to the discard page, and check the back link works
    await CheckBeforeCreatingPrnPage.discardAndStartAgain()
    await ConfirmDiscardPRNPage.selectBackLink()

    await CheckBeforeCreatingPrnPage.createPRN()

    const message = await PrnCreatedPage.messageText()

    expect(message).toContain('PRN created')
    expect(message).toContain('Tonnage')
    expect(message).toContain(tonnageWordings.integer + ' tonnes')

    await PrnCreatedPage.returnToRegistrationPage()

    let managePrnLink = await WasteRecordsPage.managePRNsLink()
    await managePrnLink.click()

    const awaitingAuthorisationStatus = 'Awaiting authorisation'

    // PRN Dashboard checks - Waste Balance Amount, Awaiting Authorisation table values
    let wasteBalanceAmount = await PrnDashboardPage.wasteBalanceAmount()

    expect(wasteBalanceAmount).toBe(expectedWasteBalance + ' tonnes')
    const today = new Date()

    const expectedCreateDate = today.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    const awaitingAuthRow =
      await PrnDashboardPage.getAwaitingAuthorisationRow(1)
    expect(awaitingAuthRow.get('Issued to')).toEqual(producer)
    expect(awaitingAuthRow.get('Date created')).toEqual(expectedCreateDate)
    expect(awaitingAuthRow.get('Tonnage')).toEqual(`${tonnageWordings.integer}`)
    expect(awaitingAuthRow.get('Status')).toEqual(awaitingAuthorisationStatus)
    // End of PRN Dashboard checks

    await PrnDashboardPage.selectAwaitingAuthorisationLink(1)
    await checkViewPrnDetails(
      organisationDetails,
      producer,
      tonnageWordings,
      issuerNotes,
      awaitingAuthorisationStatus,
      materialDesc,
      accNumber
    )

    await PrnViewPage.returnToPRNList()

    // Make sure Create a PRN button works and brings to PRN creation page
    await PrnDashboardPage.createAPrnButton()

    // Check Create PRN validation errors
    const createAPrnPageHeading = await CreatePRNPage.headingText()
    expect(createAPrnPageHeading).toBe('Create a PRN')

    await CreatePRNPage.continue()

    const errorMessages = await CreatePRNPage.errorMessages()
    expect(errorMessages.length).toBe(2)
    expect(errorMessages).toEqual([
      'Enter a whole number',
      'Select who this will be issued to'
    ])
    // End of Check Create PRN validation errors

    await HomePage.homeLink()

    await DashboardPage.selectTableLink(1, 1)
    const managePrnsLink = await WasteRecordsPage.managePRNsLink()
    await managePrnsLink.click()

    // Issue the created PRN
    await PrnDashboardPage.selectAwaitingAuthorisationLink(1)
    await PrnViewPage.issuePRNButton()

    let prnIssuedText = await PrnIssuedPage.messageText()

    expect(prnIssuedText).toContain('PRN issued to ' + producer)
    expect(prnIssuedText).toContain('PRN number:')

    let prnNumber = await PrnIssuedPage.prnNumberText()
    const prnNoPattern = /ER\d{6}/
    expect(prnNoPattern.test(prnNumber)).toEqual(true)

    await PrnIssuedPage.viewPdfButton()

    const awaitingAcceptanceStatus = 'Awaiting acceptance'
    await checkViewPrnDetails(
      organisationDetails,
      producer,
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
    prnLink = await WasteRecordsPage.createNewPRNLink()
    await prnLink.click()

    const newProducer = 'BigCo Waste Solutions'
    const newTonnageWordings = {
      integer: 19,
      word: 'Nineteen'
    }
    const newIssuerNotes = 'Testing another PRN'

    await createAndCheckPrnDetails(
      newTonnageWordings,
      newProducer,
      newIssuerNotes,
      newIssuerNotes,
      organisationDetails,
      materialDesc,
      accNumber
    )

    await CheckBeforeCreatingPrnPage.createPRN()

    const newMessage = await PrnCreatedPage.messageText()

    expect(newMessage).toContain('PRN created')
    expect(newMessage).toContain('Tonnage')
    expect(newMessage).toContain(newTonnageWordings.integer + ' tonnes')
    // End of new PRN creation

    await PrnCreatedPage.returnToRegistrationPage()

    managePrnLink = await WasteRecordsPage.managePRNsLink()
    await managePrnLink.click()

    const newAwaitingAuthRow =
      await PrnDashboardPage.getAwaitingAuthorisationRow(1)
    expect(newAwaitingAuthRow.get('Issued to')).toEqual(newProducer)
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
      newProducer,
      newTonnageWordings,
      newIssuerNotes,
      awaitingAuthorisationStatus,
      materialDesc,
      accNumber
    )

    await PrnViewPage.issuePRNButton()

    prnIssuedText = await PrnIssuedPage.messageText()

    expect(prnIssuedText).toContain('PRN issued to ' + newProducer)
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

    await WasteRecordsPage.selectBackLink()

    const expectedUpdatedWasteBalance = '170.28'
    const availableWasteBalance = await DashboardPage.availableWasteBalance(1)
    expect(availableWasteBalance).toBe(expectedUpdatedWasteBalance)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
