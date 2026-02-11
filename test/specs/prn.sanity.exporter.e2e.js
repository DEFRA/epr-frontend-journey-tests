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
import { tradingName } from '../support/fixtures.js'
import { PrnHelper } from '~/test/support/prn.helper.js'

describe('Packing Recycling Notes (Sanity)', () => {
  it('Should be able to create and manage PRNs for all materials for Exporter @sanitycheck', async () => {
    const { organisationDetails, userEmail } =
      await createOrgWithAllWasteProcessingTypeAllMaterials()
    const user = await createAndRegisterDefraIdUser(userEmail)
    await linkDefraIdUser(organisationDetails.refNo, user.userId, userEmail)

    await HomePage.openStart()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(userEmail)

    const tonnageWordingsExporter = [
      { integer: 1456, word: 'One thousand four hundred and fifty six' },
      { integer: 834, word: 'Eight hundred and thirty four' },
      { integer: 7, word: 'Seven' },
      { integer: 219, word: 'Two hundred and nineteen' },
      { integer: 3, word: 'Three' },
      {
        integer: 487203,
        word: 'Four hundred and eighty seven thousand two hundred and three'
      },
      {
        integer: 929999,
        word: 'Nine hundred and twenty nine thousand nine hundred and ninety nine'
      },
      { integer: 68000, word: 'Sixty eight thousand' }
    ]

    for (let i = 0; i < MATERIALS.length; i++) {
      console.log('Exporter -- Creating PRN for material: ' + MATERIALS[i].name)

      await DashboardPage.selectExportingTab()
      await DashboardPage.selectTableLink(i + 1, 1)

      const regNumber = `E25SR500020912${MATERIALS[i].suffix}`
      const accNumber = `E-ACC12245${MATERIALS[i].suffix}`

      const regNo = await $(`//a[normalize-space()="${regNumber}"]`)
      expect(regNo).toExist()

      const accNo = await $(`//a[normalize-space()="${accNumber}"]`)
      expect(accNo).toExist()

      await WasteRecordsPage.submitSummaryLogLink()

      await UploadSummaryLogPage.performUploadAndReturnToHomepage(
        `resources/sanity/exporter_${accNumber}_${regNumber}.xlsx`
      )

      await DashboardPage.selectExportingTab()
      await DashboardPage.selectTableLink(i + 1, 1)

      await WasteRecordsPage.createNewPERNLink()

      const prnHelper = new PrnHelper(true)

      const prnDetails = {
        tonnageWordings: tonnageWordingsExporter[i],
        tradingName,
        issuerNotes: 'Testing',
        organisationDetails,
        materialDesc: MATERIALS[i].prnName,
        accNumber,
        process: MATERIALS[i].process
      }

      await prnHelper.createAndCheckPrnDetails(prnDetails)

      await PrnCreatedPage.returnToRegistrationPage()
    }

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
