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
import ConfirmDeletePRNPage from 'page-objects/confirm.delete.prn.page.js'

describe('Deleting Packing Recycling Notes (Exporter)', () => {
  it('Should be able to create and delete PRN for Fibre (Exporter) @delprnexp', async () => {
    const regNumber = 'E25SR500020912FB'
    const accNumber = 'E-ACC12245FB'

    const organisationDetails = await createLinkedOrganisation([
      {
        material: 'Fibre-based composite material (R3)',
        wasteProcessingType: 'Exporter'
      }
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

    await DashboardPage.selectTableLink(1, 1)

    await WasteRecordsPage.submitSummaryLogLink()

    const filePath = `resources/sanity/exporter_${accNumber}_${regNumber}.xlsx`
    await UploadSummaryLogPage.performUploadAndReturnToHomepage(filePath)

    await DashboardPage.selectTableLink(1, 1)

    await WasteRecordsPage.createNewPERNLink()

    const tradingName = 'Bigco Packaging Ltd'
    const producer = `${tradingName}, Zig Zag road, Box Hill, Tadworth, KT20 7LB`
    let issuerNotes = ''

    issuerNotes = 'Testing'
    await CreatePRNPage.createPrn(
      tonnageWordings.integer,
      producer,
      issuerNotes
    )

    const headingText = await CheckBeforeCreatingPrnPage.headingText()
    expect(headingText).toBe('Check before creating PERN')
    await CheckBeforeCreatingPrnPage.createPRN()

    const message = await PrnCreatedPage.messageText()

    const awaitingAuthorisationStatus = 'Awaiting authorisation'

    expect(message).toContain('PERN created')
    expect(message).toContain(awaitingAuthorisationStatus)

    await PrnCreatedPage.returnToRegistrationPage()
    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.managePERNsLink()

    // Check No PERNs have been issued yet message
    await PrnDashboardPage.selectIssuedTab()
    const noIssuedPrnMessage = await PrnDashboardPage.getNoIssuedPrnMessage()
    expect(noIssuedPrnMessage).toBe('No PERNs have been issued yet.')

    // Return to awaiting authorisation PERNs
    await PrnDashboardPage.selectAwaitingActionTab()
    await PrnDashboardPage.selectAwaitingAuthorisationLink(1)

    // Test the back link on Delete PERN confirmation page first
    await PrnViewPage.deletePRNButton()

    let confirmDeleteHeadingText = await ConfirmDeletePRNPage.headingText()
    expect(confirmDeleteHeadingText).toBe(
      'Are you sure you want to delete this PERN?'
    )
    await ConfirmDeletePRNPage.selectBackLink()

    // Now delete the PERN
    await PrnViewPage.deletePRNButton()
    confirmDeleteHeadingText = await ConfirmDeletePRNPage.headingText()
    expect(confirmDeleteHeadingText).toBe(
      'Are you sure you want to delete this PERN?'
    )
    await ConfirmDeletePRNPage.deletePrn()

    const noCreatedPrnMessage = await PrnDashboardPage.getNoCreatedPrnMessage()
    expect(noCreatedPrnMessage).toBe('You have not created any PERNs.')

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
