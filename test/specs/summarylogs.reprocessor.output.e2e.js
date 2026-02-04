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
// import CreatePRNPage from 'page-objects/create.prn.page.js'

describe('Summary Logs Reprocessor Output', () => {
  it('Should be able to submit a (Steel) Reprocessor Output Summary Log spreadsheet (6 rows total, but only 1 added for waste balance) @reproOutput', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Steel (R4)', wasteProcessingType: 'Reprocessor' }
    ])

    const userEmail = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: 'R25SR500050912PA',
          accNumber: 'ACC500591',
          status: 'approved',
          validFrom: '2026-01-01'
        }
      ]
    )

    const user = await createAndRegisterDefraIdUser(userEmail)
    await linkDefraIdUser(organisationDetails.refNo, user.userId, userEmail)

    await HomePage.open()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(userEmail)

    const dashboardHeaderText = await DashboardPage.dashboardHeaderText()

    expect(dashboardHeaderText).toContain(
      organisationDetails.organisation.companyName
    )

    await DashboardPage.selectLink(1)

    const regNo = await $('//a[normalize-space()="R25SR500050912PA"]')
    expect(regNo).toExist()

    const accNo = await $('//a[normalize-space()="ACC500591"]')
    expect(accNo).toExist()

    await WasteRecordsPage.submitSummaryLogLink()
    await expect(browser).toHaveTitle(
      expect.stringContaining('Summary log: upload')
    )
    await UploadSummaryLogPage.uploadFile('resources/reprocessor-output.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your file is being checked', 30)

    await checkBodyText('Check before confirming upload', 30)
    await checkBodyText('1 new load will be added to your waste balance', 30)
    await UploadSummaryLogPage.confirmAndSubmit()

    await checkBodyText('Your waste records are being updated', 30)

    await checkBodyText('Summary log uploaded', 30)
    await checkBodyText('Your updated waste balance', 10)
    await checkBodyText('3.00 tonnes', 10)

    await UploadSummaryLogPage.clickOnReturnToHomePage()

    let availableWasteBalance = await DashboardPage.availableWasteBalance(1)
    expect(availableWasteBalance).toBe('3.00')

    await DashboardPage.selectLink(1)
    let wasteBalanceAmount = await WasteRecordsPage.wasteBalanceAmount()

    expect(wasteBalanceAmount).toBe('3.00 tonnes')

    await WasteRecordsPage.submitSummaryLogLink()
    await expect(browser).toHaveTitle(
      expect.stringContaining('Summary log: upload')
    )
    await UploadSummaryLogPage.uploadFile(
      'resources/reprocessor-output-adjustments.xlsx'
    )
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your file is being checked', 30)

    await checkBodyText('Check before confirming upload', 30)
    await checkBodyText(
      '1 adjusted load will be reflected in your waste balance',
      30
    )

    await UploadSummaryLogPage.confirmAndSubmit()

    await checkBodyText('Your waste records are being updated', 30)

    await checkBodyText('Summary log uploaded', 30)
    await checkBodyText('Your updated waste balance', 10)
    await checkBodyText('9.25 tonnes', 10)

    await UploadSummaryLogPage.clickOnReturnToHomePage()

    availableWasteBalance = await DashboardPage.availableWasteBalance(1)
    expect(availableWasteBalance).toBe('9.25')

    await DashboardPage.selectLink(1)
    wasteBalanceAmount = await WasteRecordsPage.wasteBalanceAmount()

    expect(wasteBalanceAmount).toBe('9.25 tonnes')

    // TODO: temporarily disabling the PRN page visit until we
    // mock out the waste organisations API response

    // const prnLink = await WasteRecordsPage.createNewPRNLink()
    // await prnLink.click()

    // const prnHeading = await CreatePRNPage.headingText()
    // expect(prnHeading).toBe('Create a PRN')

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
