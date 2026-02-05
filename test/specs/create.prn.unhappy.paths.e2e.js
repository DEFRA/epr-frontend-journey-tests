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
import ConfirmDiscardPRNPage from 'page-objects/confirm.discard.prn.page.js'
import PrnDashboardPage from 'page-objects/prn.dashboard.page.js'

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

describe('Creating Packing Recycling Notes', () => {
  it('Should test various (Unhappy) paths for Create PRN @createprn', async () => {
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
      word: 'Two hundred and three'
    }

    await DashboardPage.selectTableLink(1, 1)

    const prnLink = await WasteRecordsPage.createNewPRNLink()
    await prnLink.click()

    const producer =
      'Acme Compliance Scheme, 37th Place, Ashfield, Chicago, W1 L3Y'
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

    // Check Create PRN validation errors
    let createAPrnPageHeading = await CreatePRNPage.headingText()
    expect(createAPrnPageHeading).toBe('Create a PRN')
    let materialDetails = await CreatePRNPage.materialDetails()
    expect(materialDetails).toBe('Material: Paper and board')

    await CreatePRNPage.continue()

    let errorMessages = await CreatePRNPage.errorMessages()
    expect(errorMessages.length).toBe(2)
    expect(errorMessages).toEqual([
      'Enter PRN tonnage as a whole number',
      'Select who this will be issued to'
    ])

    await createAndCheckPrnDetails(
      tonnageWordings,
      producer,
      issuerNotes,
      issuerNotes,
      organisationDetails,
      materialDesc,
      accNumber
    )
    await CheckBeforeCreatingPrnPage.createPRN()

    // Now we see an error message related to tonnage exceeding waste balance
    errorMessages = await CreatePRNPage.errorMessages()
    expect(errorMessages.length).toBe(1)
    expect(errorMessages).toEqual([
      'The tonnage you entered exceeds your available waste balance'
    ])
    // End of Check Create PRN validation errors

    // Check Create a PRN page is accessible from PRN Dashboard button
    await HomePage.homeLink()
    await DashboardPage.selectTableLink(1, 1)
    const managePrnLink = await WasteRecordsPage.managePRNsLink()
    await managePrnLink.click()
    await PrnDashboardPage.createAPrnButton()

    // Check we are on Create a PRN Page
    createAPrnPageHeading = await CreatePRNPage.headingText()
    expect(createAPrnPageHeading).toBe('Create a PRN')
    materialDetails = await CreatePRNPage.materialDetails()
    expect(materialDetails).toBe('Material: Paper and board')

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
