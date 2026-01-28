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
import PRNPage from 'page-objects/prn.page.js'
import CheckBeforeCreatingPrnPage from 'page-objects/check.before.creating.prn.page.js'
import PrnCreatedPage from 'page-objects/prn.created.page.js'

describe('Packing Recycling Notes', () => {
  it.skip('Should be able to submit a Reprocessor Input waste balance and create PRNs @prn', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor' },
      { material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor' },
      { material: 'Paper or board (R3)', wasteProcessingType: 'Exporter' }
    ])

    // We adjust validFrom date to test filtering of rows from the Summary Log upload
    const userEmail = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'input',
          regNumber: 'R25SR500030912PA',
          accNumber: 'ACC123456',
          status: 'approved'
        },
        {
          reprocessingType: 'output',
          regNumber: 'RO25SR5111050912PA',
          accNumber: 'ROACC123456PA',
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
    const organisation = organisationDetails.organisation

    await linkDefraIdUser(organisationDetails.refNo, user.userId, userEmail)

    await HomePage.openStart()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(userEmail)

    await DashboardPage.selectTableLink(1, 1)

    const regNo = await $('//a[normalize-space()="RI25SR5111050912PA"]')
    expect(regNo).toExist()

    const accNo = await $('//a[normalize-space()="RIACC123456PA"]')
    expect(accNo).toExist()

    await WasteRecordsPage.submitSummaryLogLink()

    await UploadSummaryLogPage.uploadFile('resources/summary-log.xlsx')
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
    const issuerNotes = 'Testing'

    await PRNPage.enterTonnage(10)
    await PRNPage.select(producer)
    await PRNPage.addIssuerNotes(issuerNotes)
    await PRNPage.continue()

    const headingText = await CheckBeforeCreatingPrnPage.headingText()
    expect(headingText).toBe('Check before creating PRN')

    const prnDetails = await CheckBeforeCreatingPrnPage.prnDetails()
    expect(prnDetails['Issued by']).toBe(organisation.companyName)
    expect(prnDetails['Packaging waste producer or compliance scheme']).toBe(
      producer
    )
    expect(prnDetails['Tonnage']).toBe('10')
    expect(prnDetails['Issue comments']).toBe(issuerNotes)

    const accreditationDetails =
      await CheckBeforeCreatingPrnPage.accreditationDetails()
    expect(accreditationDetails['Material']).toBe('Paper and board')
    expect(accreditationDetails['Accreditation number']).toBe('ACC123456')
    expect(
      accreditationDetails['Accreditation address'].replaceAll(', ', ',')
    ).toBe(organisationDetails.regAddresses[0])

    await CheckBeforeCreatingPrnPage.createPRN()

    const message = await PrnCreatedPage.messageText()

    expect(message).toContain('PRN created')
    expect(message).toContain('Tonnage')
    expect(message).toContain('10 tonnes')

    await PrnCreatedPage.returnToRegistrationPage()

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
