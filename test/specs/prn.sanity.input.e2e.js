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
import PrnCreatedPage from 'page-objects/prn.created.page.js'
import { MATERIALS } from '../support/materials.js'
import UploadSummaryLogPage from 'page-objects/upload.summary.log.page.js'
import PrnDashboardPage from 'page-objects/prn.dashboard.page.js'
import PrnViewPage from 'page-objects/prn.view.page.js'
import {
  createPrnDetails,
  secondTradingName as tradingName
} from '../support/fixtures.js'
import { PrnHelper } from '../support/prn.helper.js'

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
      const prnHelper = new PrnHelper()

      const prnDetails = createPrnDetails({
        tonnageWordings: tonnageWordings[i],
        tradingName,
        organisationDetails,
        regAddress: organisationDetails.regAddresses[orgAddressIndex],
        materialDesc: MATERIALS[i].prnName,
        accNumber,
        process: MATERIALS[i].process
      })

      await prnHelper.createAndCheckPrnDetails(prnDetails)

      await PrnCreatedPage.returnToRegistrationPage()
      await DashboardPage.selectTableLink(1, i + 1)
      await WasteRecordsPage.managePRNsLink()

      let wasteBalanceAmount = await PrnDashboardPage.wasteBalanceAmount()
      expect(wasteBalanceAmount).toBe(expectedWasteBalances[i] + ' tonnes')

      await prnHelper.checkAwaitingRows(prnDetails, 1)
      await PrnDashboardPage.selectAwaitingLink(1)

      await prnHelper.checkViewPrnDetails(prnDetails)
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
