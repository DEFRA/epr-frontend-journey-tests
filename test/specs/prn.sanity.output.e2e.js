import { $, browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import {
  createAndRegisterDefraIdUser,
  createOrgWithAllWasteProcessingTypeAllMaterials,
  linkDefraIdUser
} from '../support/apicalls.js'
import CreatePRNPage from 'page-objects/create.prn.page.js'
import CheckBeforeCreatingPrnPage from 'page-objects/check.before.creating.prn.page.js'
import PrnCreatedPage from 'page-objects/prn.created.page.js'
import { MATERIALS } from '../support/materials.js'
import UploadSummaryLogPage from 'page-objects/upload.summary.log.page.js'
import { checkBodyText } from '../support/checks.js'

describe('Packing Recycling Notes (Sanity)', () => {
  it('Should be able to create and manage PRNs for all materials for Reprocessor Output @sanitycheck', async () => {
    const { organisationDetails, userEmail } =
      await createOrgWithAllWasteProcessingTypeAllMaterials()
    const user = await createAndRegisterDefraIdUser(userEmail)
    await linkDefraIdUser(organisationDetails.refNo, user.userId, userEmail)

    await HomePage.openStart()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(userEmail)

    let orgAddressIndex = 8

    const tonnageWordingsOutput = [
      { integer: 245, word: 'Two hundred and forty five' },
      {
        integer: 18923,
        word: 'Eighteen thousand nine hundred and twenty three'
      },
      { integer: 5, word: 'Five' },
      {
        integer: 571482,
        word: 'Five hundred and seventy one thousand four hundred and eighty two'
      },
      { integer: 9307, word: 'Nine thousand three hundred and seven' },
      { integer: 42, word: 'Forty two' },
      {
        integer: 83516,
        word: 'Eighty three thousand five hundred and sixteen'
      },
      { integer: 156, word: 'One hundred and fifty six' }
    ]

    // Sanity check Reprocessor Output materials
    for (let i = 0; i < MATERIALS.length; i++) {
      console.log(
        'Reprocessor Output -- Creating PRN for material: ' + MATERIALS[i].name
      )
      await DashboardPage.selectTableLink(2, i + 1)

      const regNumber = `R25SR500010912${MATERIALS[i].suffix}`
      const accNumber = `R-ACC12145${MATERIALS[i].suffix}`

      const regNo = await $(`//a[normalize-space()="${regNumber}"]`)
      expect(regNo).toExist()

      const accNo = await $(`//a[normalize-space()="${accNumber}"]`)
      expect(accNo).toExist()

      await WasteRecordsPage.submitSummaryLogLink()

      await UploadSummaryLogPage.uploadFile(
        `resources/sanity/reprocessorOutput_${accNumber}_${regNumber}.xlsx`
      )
      await UploadSummaryLogPage.continue()

      await checkBodyText('Your file is being checked', 30)
      await checkBodyText('Check before confirming upload', 30)
      await UploadSummaryLogPage.confirmAndSubmit()

      await checkBodyText('Your waste records are being updated', 30)
      await checkBodyText('Summary log uploaded', 30)
      await UploadSummaryLogPage.clickOnReturnToHomePage()

      await DashboardPage.selectTableLink(2, i + 1)

      const prnLink = await WasteRecordsPage.createNewPRNLink()
      await prnLink.click()

      const tradingName = 'Green Waste Solutions'
      const producer =
        'Green Waste Solutions, 1 Worlds End Lane, Green St Green, BR6 6AG, England'
      const issuerNotes = 'Testing'

      await CreatePRNPage.enterTonnage(tonnageWordingsOutput[i].integer)
      await CreatePRNPage.select(producer)
      await CreatePRNPage.addIssuerNotes(issuerNotes)
      await CreatePRNPage.continue()

      const headingText = await CheckBeforeCreatingPrnPage.headingText()
      expect(headingText).toBe('Check before creating PRN')

      const prnDetails = await CheckBeforeCreatingPrnPage.prnDetails()
      expect(prnDetails['Issuer']).toBe(
        organisationDetails.organisation.companyName
      )
      expect(prnDetails['Packaging waste producer or compliance scheme']).toBe(
        tradingName
      )
      expect(prnDetails['Tonnage']).toBe(`${tonnageWordingsOutput[i].integer}`)
      expect(prnDetails['Tonnage in words']).toBe(tonnageWordingsOutput[i].word)
      expect(prnDetails['Process to be used']).toBe(MATERIALS[i].process)
      expect(prnDetails['Issuer notes']).toBe(issuerNotes)

      const accreditationDetails =
        await CheckBeforeCreatingPrnPage.accreditationDetails()
      expect(accreditationDetails['Material']).toBe(MATERIALS[i].prnName)
      expect(accreditationDetails['Accreditation number']).toBe(accNumber)
      expect(
        accreditationDetails['Accreditation address'].replaceAll(', ', ',')
      ).toBe(organisationDetails.regAddresses[orgAddressIndex])

      await CheckBeforeCreatingPrnPage.createPRN()

      const message = await PrnCreatedPage.messageText()

      expect(message).toContain('PRN created')
      expect(message).toContain('Awaiting authorisation')

      await PrnCreatedPage.returnToRegistrationPage()

      orgAddressIndex++
    }

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
