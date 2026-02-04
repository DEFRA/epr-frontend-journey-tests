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
import PRNPage from 'page-objects/create.prn.page.js'
import CheckBeforeCreatingPrnPage from 'page-objects/check.before.creating.prn.page.js'
import PrnCreatedPage from 'page-objects/prn.created.page.js'
import { MATERIALS } from '../support/materials.js'
import UploadSummaryLogPage from 'page-objects/upload.summary.log.page.js'
import { checkBodyText } from '~/test/support/checks.js'

describe('Packing Recycling Notes (Sanity)', () => {
  it('Should be able to create and manage PRNs for all materials for Exporter @sanitycheck', async () => {
    const { organisationDetails, userEmail } =
      await createOrgWithAllWasteProcessingTypeAllMaterials()
    const user = await createAndRegisterDefraIdUser(userEmail)
    await linkDefraIdUser(organisationDetails.refNo, user.userId, userEmail)

    await HomePage.openStart()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(userEmail)

    // Sanity check Exporter materials
    await DashboardPage.selectExportingTab()

    const tonnageWordingsExporter = [
      { integer: 1456, word: 'One Thousand Four Hundred Fifty Six' },
      { integer: 834, word: 'Eight Hundred Thirty Four' },
      { integer: 7, word: 'Seven' },
      { integer: 219, word: 'Two Hundred Nineteen' },
      { integer: 3, word: 'Three' },
      {
        integer: 487203,
        word: 'Four Hundred Eighty Seven Thousand Two Hundred Three'
      },
      {
        integer: 929999,
        word: 'Nine Hundred Twenty Nine Thousand Nine Hundred Ninety Nine'
      },
      { integer: 68000, word: 'Sixty Eight Thousand' }
    ]

    for (let i = 0; i < MATERIALS.length; i++) {
      console.log('Exporter -- Creating PRN for material: ' + MATERIALS[i].name)
      await DashboardPage.selectTableLink(i + 1, 1)

      const regNumber = `E25SR500020912${MATERIALS[i].suffix}`
      const accNumber = `E-ACC12245${MATERIALS[i].suffix}`

      const regNo = await $(`//a[normalize-space()="${regNumber}"]`)
      expect(regNo).toExist()

      const accNo = await $(`//a[normalize-space()="${accNumber}"]`)
      expect(accNo).toExist()

      await WasteRecordsPage.submitSummaryLogLink()

      await UploadSummaryLogPage.uploadFile(
        `resources/sanity/exporter_${accNumber}_${regNumber}.xlsx`
      )
      await UploadSummaryLogPage.continue()

      await checkBodyText('Your file is being checked', 30)
      await checkBodyText('Check before confirming upload', 30)
      await UploadSummaryLogPage.confirmAndSubmit()

      await checkBodyText('Your waste records are being updated', 30)
      await checkBodyText('Summary log uploaded', 30)
      await UploadSummaryLogPage.clickOnReturnToHomePage()

      await DashboardPage.selectExportingTab()
      await DashboardPage.selectTableLink(i + 1, 1)

      const pernLink = await WasteRecordsPage.createNewPERNLink()
      await pernLink.click()

      const producer = 'EcoRecycle Industries'
      const issuerNotes = 'Testing'

      await PRNPage.enterTonnage(tonnageWordingsExporter[i].integer)
      await PRNPage.select(producer)
      await PRNPage.addIssuerNotes(issuerNotes)
      await PRNPage.continue()

      const headingText = await CheckBeforeCreatingPrnPage.headingText()
      expect(headingText).toBe('Check before creating PERN')

      const prnDetails = await CheckBeforeCreatingPrnPage.prnDetails()
      expect(prnDetails['Issuer']).toBe(
        organisationDetails.organisation.companyName
      )
      expect(prnDetails['Packaging waste producer or compliance scheme']).toBe(
        producer
      )
      expect(prnDetails['Tonnage']).toBe(
        `${tonnageWordingsExporter[i].integer}`
      )
      //TODO: Fix these?
      // expect(prnDetails['Tonnage in words']).toBe(tonnageWordingsExporter[i].word)
      expect(prnDetails['Process to be used']).toBe(MATERIALS[i].process)
      expect(prnDetails['Issuer notes']).toBe(issuerNotes)

      const accreditationDetails =
        await CheckBeforeCreatingPrnPage.accreditationDetails()
      expect(accreditationDetails['Material']).toBe(MATERIALS[i].prnName)
      expect(accreditationDetails['Accreditation number']).toBe(accNumber)

      await CheckBeforeCreatingPrnPage.createPRN()

      const message = await PrnCreatedPage.messageText()

      expect(message).toContain('PERN created')
      expect(message).toContain('Tonnage')
      expect(message).toContain(tonnageWordingsExporter[i].integer + ' tonnes')

      await PrnCreatedPage.returnToRegistrationPage()

      await WasteRecordsPage.selectBackLink()
    }

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
