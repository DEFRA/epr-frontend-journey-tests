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
import PRNPage from 'page-objects/prn.page.js'
import CheckBeforeCreatingPrnPage from 'page-objects/check.before.creating.prn.page.js'
import PrnCreatedPage from 'page-objects/prn.created.page.js'
import UploadSummaryLogPage from 'page-objects/upload.summary.log.page.js'
import { checkBodyText } from '~/test/support/checks.js'
import PrnDashboardPage from 'page-objects/prn.dashboard.page.js'
import PrnViewPage from 'page-objects/prn.view.page.js'

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
  //TODO: Fix these?
  // expect(prnDetails['Tonnage in words']).toBe(tonnageWordings.word)
  // expect(prnDetails['Process to be used']).toBe('R3')
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

    await DashboardPage.selectTableLink(1, 1)

    const prnLink = await WasteRecordsPage.createNewPRNLink()
    await prnLink.click()

    const producer = 'EcoRecycle Industries'
    const issuer = 'producer-3'
    const issuerNotes = 'Testing'

    await PRNPage.enterTonnage(tonnageWordings.integer)
    await PRNPage.select(producer)
    await PRNPage.addIssuerNotes(issuerNotes)
    await PRNPage.continue()

    let headingText = await CheckBeforeCreatingPrnPage.headingText()
    expect(headingText).toBe('Check before creating PRN')
    await checkPrnDetails(
      organisationDetails,
      materialDesc,
      producer,
      tonnageWordings,
      issuerNotes,
      accNumber
    )

    await CheckBeforeCreatingPrnPage.discardAndStartAgain()

    await PRNPage.enterTonnage(tonnageWordings.integer)
    await PRNPage.select(producer)
    await PRNPage.addIssuerNotes(issuerNotes)
    await PRNPage.continue()

    headingText = await CheckBeforeCreatingPrnPage.headingText()
    expect(headingText).toBe('Check before creating PRN')
    await checkPrnDetails(
      organisationDetails,
      materialDesc,
      producer,
      tonnageWordings,
      issuerNotes,
      accNumber
    )

    await CheckBeforeCreatingPrnPage.createPRN()

    const message = await PrnCreatedPage.messageText()

    expect(message).toContain('PRN created')
    expect(message).toContain('Tonnage')
    expect(message).toContain(tonnageWordings.integer + ' tonnes')

    await PrnCreatedPage.returnToRegistrationPage()

    const managePrnLink = await WasteRecordsPage.managePRNsLink()
    await managePrnLink.click()

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
    expect(awaitingAuthRow.get('Issued to')).toEqual(issuer)
    expect(awaitingAuthRow.get('Date created')).toEqual(expectedCreateDate)
    expect(awaitingAuthRow.get('Tonnage')).toEqual(`${tonnageWordings.integer}`)
    expect(awaitingAuthRow.get('Status')).toEqual('Awaiting authorisation')

    await PrnDashboardPage.selectAwaitingAuthorisationLink(1)

    const prnViewDetails = await PrnViewPage.prnDetails()
    expect(prnViewDetails['Issued by']).toBe(
      organisationDetails.organisation.companyName
    )
    expect(prnViewDetails['Buyer']).toBe(issuer)
    expect(prnViewDetails['Tonnage']).toBe(`${tonnageWordings.integer}`)
    expect(prnViewDetails['Issuer notes']).toBe(issuerNotes)
    //TODO: Fix these?
    // expect(prnViewDetails['Tonnage in words']).toBe(tonnageWordings.word)
    // expect(prnViewDetails['Process to be used']).toBe('R3')

    const accreditationViewDetails = await PrnViewPage.accreditationDetails()
    expect(accreditationViewDetails['Material']).toBe(materialDesc)
    expect(accreditationViewDetails['Accreditation number']).toBe(accNumber)
    expect(
      accreditationViewDetails['Accreditation address'].replaceAll(', ', ',')
    ).toBe(organisationDetails.regAddresses[0])

    await PrnViewPage.returnToPRNList()

    await PrnDashboardPage.selectBackLink()

    wasteBalanceAmount = await WasteRecordsPage.wasteBalanceAmount()
    expect(wasteBalanceAmount).toBe(expectedWasteBalance + ' tonnes')
    await WasteRecordsPage.selectBackLink()

    const availableWasteBalance = await DashboardPage.availableWasteBalance(1)
    expect(availableWasteBalance).toBe(expectedWasteBalance)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
