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
import PrnDashboardPage from 'page-objects/prn.dashboard.page.js'
import PrnViewPage from 'page-objects/prn.view.page.js'
import {
  secondTradingName as tradingName,
  secondName as name
} from '../support/fixtures.js'

describe('Packing Recycling Notes (Sanity)', () => {
  it('Should be able to create and manage PRNs for all materials for Reprocessor Input @sanitycheck', async () => {
    const { organisationDetails, userEmail } =
      await createOrgWithAllWasteProcessingTypeAllMaterials()
    const user = await createAndRegisterDefraIdUser(userEmail)
    await linkDefraIdUser(organisationDetails.refNo, user.userId, userEmail)

    await HomePage.openStart()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(userEmail)

    let orgAddressIndex = 0

    const tonnageWordings = [
      { integer: 7, word: 'Seven' },
      { integer: 257, word: 'Two hundred and fifty seven' },
      { integer: 19, word: 'Nineteen' },
      { integer: 306, word: 'Three hundred and six' },
      {
        integer: 203,
        word: 'Two hundred and three'
      },
      { integer: 156, word: 'One hundred and fifty six' },
      {
        integer: 99,
        word: 'Ninety nine'
      },
      { integer: 68, word: 'Sixty eight' }
    ]

    // Tonnage values expected from Summary Log files upload
    // Aluminium        345.78
    // Fibre	         	313.44
    // Glass remelt	  	403.83
    // Glass other	    1,022.20
    // Paper and board	392.28
    // Plastic	      	420.18
    // Steel	         	275.10
    // Wood	           	203.38

    const expectedWasteBalances = [
      '338.78',
      '56.44',
      '384.83',
      '716.20',
      '189.28',
      '264.18',
      '176.10',
      '135.38'
    ]

    // Sanity check Reprocessor Input materials
    for (let i = 0; i < MATERIALS.length; i++) {
      console.log(
        'Reprocessor Input -- Creating PRN for material: ' + MATERIALS[i].name
      )
      await DashboardPage.selectTableLink(1, i + 1)
      const regNumber = `R25SR500000912${MATERIALS[i].suffix}`
      const accNumber = `R-ACC12045${MATERIALS[i].suffix}`

      const regNo = await $(`//a[normalize-space()="${regNumber}"]`)
      expect(regNo).toExist()

      const accNo = await $(`//a[normalize-space()="${accNumber}"]`)
      expect(accNo).toExist()

      await WasteRecordsPage.submitSummaryLogLink()

      await UploadSummaryLogPage.performUploadAndReturnToHomepage(
        `resources/sanity/reprocessorInput_${accNumber}_${regNumber}.xlsx`
      )

      await DashboardPage.selectTableLink(1, i + 1)

      await WasteRecordsPage.createNewPRNLink()

      const issuerNotes = 'Testing'

      const materialDetails = await CreatePRNPage.materialDetails()
      expect(materialDetails).toBe('Material: ' + MATERIALS[i].prnName)

      await CreatePRNPage.enterTonnage(tonnageWordings[i].integer)
      await CreatePRNPage.enterValue(tradingName)
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
      expect(prnDetails['Tonnage']).toBe(`${tonnageWordings[i].integer}`)
      expect(prnDetails['Tonnage in words']).toBe(tonnageWordings[i].word)
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

      await DashboardPage.selectTableLink(1, i + 1)

      await WasteRecordsPage.managePRNsLink()

      let wasteBalanceAmount = await PrnDashboardPage.wasteBalanceAmount()
      expect(wasteBalanceAmount).toBe(expectedWasteBalances[i] + ' tonnes')

      const today = new Date()
      const expectedCreateDate = today.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })

      const awaitingAuthRow =
        await PrnDashboardPage.getAwaitingAuthorisationRow(1)

      expect(awaitingAuthRow.get('Producer or compliance scheme')).toEqual(name)
      expect(awaitingAuthRow.get('Date created')).toEqual(expectedCreateDate)
      expect(awaitingAuthRow.get('Tonnage')).toEqual(
        `${tonnageWordings[i].integer}`
      )
      expect(awaitingAuthRow.get('Status')).toEqual('Awaiting authorisation')

      await PrnDashboardPage.selectAwaitingAuthorisationLink(1)

      const prnViewDetails = await PrnViewPage.prnDetails()
      expect(prnViewDetails['Issued by']).toBe(
        organisationDetails.organisation.companyName
      )

      expect(
        prnViewDetails['Packaging waste producer or compliance scheme']
      ).toBe(name)
      expect(prnViewDetails['Tonnage']).toBe(`${tonnageWordings[i].integer}`)
      expect(prnViewDetails['Issuer notes']).toBe(issuerNotes)
      expect(prnViewDetails['Tonnage in words']).toBe(tonnageWordings[i].word)
      expect(prnViewDetails['Process to be used']).toBe(MATERIALS[i].process)

      const accreditationViewDetails = await PrnViewPage.accreditationDetails()
      expect(accreditationViewDetails['Material']).toBe(MATERIALS[i].prnName)
      expect(accreditationViewDetails['Accreditation number']).toBe(accNumber)
      expect(
        accreditationViewDetails['Accreditation address'].replaceAll(', ', ',')
      ).toBe(organisationDetails.regAddresses[orgAddressIndex])

      await PrnViewPage.returnToPRNList()

      await PrnDashboardPage.selectBackLink()

      wasteBalanceAmount = await WasteRecordsPage.wasteBalanceAmount()
      expect(wasteBalanceAmount).toBe(expectedWasteBalances[i] + ' tonnes')
      await WasteRecordsPage.selectBackLink()

      const availableWasteBalance = await DashboardPage.availableWasteBalance(
        i + 1
      )
      expect(availableWasteBalance).toBe(expectedWasteBalances[i])
      orgAddressIndex++
    }

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
