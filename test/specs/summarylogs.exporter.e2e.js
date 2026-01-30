import { $, browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import UploadSummaryLogPage from '../page-objects/upload.summary.log.page.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import { checkBodyText } from '../support/checks.js'
import {
  createAndRegisterDefraIdUser,
  createLinkedOrganisation,
  linkDefraIdUser,
  updateMigratedOrganisation
} from '../support/apicalls.js'
// import PRNPage from 'page-objects/prn.page.js'

describe('Summary Logs Exporter', () => {
  it('Should be able to submit a Exporter Summary Log spreadsheet @exporter', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor' },
      { material: 'Paper or board (R3)', wasteProcessingType: 'Exporter' }
    ])

    // We adjust validFrom date to test filtering of rows from the Summary Log upload
    const userEmail = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: 'R25SR5111050912PA',
          accNumber: 'ACC123456',
          status: 'approved'
        },
        {
          regNumber: 'E25SR500030913PA',
          accNumber: 'ACC234567',
          status: 'approved',
          validFrom: '2025-02-02'
        }
      ]
    )
    const user = await createAndRegisterDefraIdUser(userEmail)

    await linkDefraIdUser(organisationDetails.refNo, user.userId, userEmail)

    await HomePage.openStart()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(userEmail)

    await DashboardPage.selectExportingTab()
    await DashboardPage.selectLink(1)

    const regNo = await $('//a[normalize-space()="E25SR500030913PA"]')
    expect(regNo).toExist()

    const accNo = await $('//a[normalize-space()="ACC234567"]')
    expect(accNo).toExist()

    await WasteRecordsPage.submitSummaryLogLink()

    await UploadSummaryLogPage.uploadFile('resources/exporter.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your file is being checked', 30)
    await checkBodyText('Check before confirming upload', 30)
    await checkBodyText('3 new loads will be added to your waste balance', 10)
    await UploadSummaryLogPage.confirmAndSubmit()

    await checkBodyText('Your waste records are being updated', 30)

    await checkBodyText('Summary log uploaded', 30)
    await checkBodyText('Your updated waste balance', 10)
    await checkBodyText('30.00 tonnes', 10)

    await UploadSummaryLogPage.clickOnReturnToHomePage()

    await DashboardPage.selectExportingTab()

    let availableWasteBalance = await DashboardPage.availableWasteBalance(1)
    expect(availableWasteBalance).toBe('30.00')

    await DashboardPage.selectLink(1)
    const wasteBalanceAmount = await WasteRecordsPage.wasteBalanceAmount()

    expect(wasteBalanceAmount).toBe('30.00 tonnes')

    await WasteRecordsPage.submitSummaryLogLink()

    await UploadSummaryLogPage.uploadFile('resources/exporter-adjustments.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your file is being checked', 30)
    await checkBodyText('Check before confirming upload', 30)
    await checkBodyText('2 new loads will be added to your waste balance', 10)
    await checkBodyText(
      '1 adjusted load will be reflected in your waste balance',
      10
    )

    await UploadSummaryLogPage.confirmAndSubmit()

    await checkBodyText('Your waste records are being updated', 30)

    await checkBodyText('Summary log uploaded', 30)
    await checkBodyText('Your updated waste balance', 10)
    await checkBodyText('89.00 tonnes', 10)

    await UploadSummaryLogPage.clickOnReturnToHomePage()

    await DashboardPage.selectExportingTab()

    availableWasteBalance = await DashboardPage.availableWasteBalance(1)
    expect(availableWasteBalance).toBe('89.00')

    await DashboardPage.selectLink(1)

    // TODO: temporarily disabling the PRN page visit until we
    // mock out the waste organisations API response

    // const pernLink = await WasteRecordsPage.createNewPERNLink()
    // await pernLink.click()

    // const prnHeading = await PRNPage.headingText()
    // expect(prnHeading).toBe('Create a PERN')

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
