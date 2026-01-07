import { browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import UploadSummaryLogPage from '../page-objects/upload.summary.log.page.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import { checkBodyText, checkUploadErrorText } from '../support/checks.js'

describe('Registration', () => {
  it('Should be able to submit a Reprocessor Input Summary Log spreadsheet', async () => {
    await HomePage.openStart()
    const href = await HomePage.getStartNowHref()
    expect(href).toBe('/login')

    await DefraIdStubPage.register()
    await expect(browser).toHaveTitle(
      expect.stringContaining('DEFRA ID Registration')
    )
    await DefraIdStubPage.registerUser()
    await DefraIdStubPage.newUserRelationship({
      id: 'relationshipId',
      orgId: '2dee1e31-5ac6-4bc4-8fe0-0820f710c2b1',
      orgName: 'ACME ltd'
    })
    await DefraIdStubPage.newUserRelationship({
      id: 'def',
      orgId: '456',
      orgName: 'Another Org'
    })

    await DefraIdStubPage.finish()

    await HomePage.open()

    let navigationLinks = await HomePage.navLinkElements()
    expect(navigationLinks.length).toBe(0)

    await HomePage.signInLink()

    await DefraIdStubPage.login()
    await DefraIdStubPage.selectOrganisation(1)

    await HomePage.linkRegistration()

    navigationLinks = await HomePage.navLinkElements()
    expect(navigationLinks.length).toBeGreaterThanOrEqual(1)

    const dashboardHeaderText = await DashboardPage.dashboardHeaderText()

    expect(dashboardHeaderText).toContain('Eco Recycle')

    await DashboardPage.selectLink(1)

    await WasteRecordsPage.submitSummaryLogLink()
    await expect(browser).toHaveTitle(
      expect.stringContaining('Summary log: upload')
    )
    await UploadSummaryLogPage.uploadFile('resources/summary-log.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your file is being uploaded', 10)

    await checkBodyText('Check before confirming upload', 20)
    await UploadSummaryLogPage.confirmAndSubmit()

    await checkBodyText('Your waste records are being updated', 5)

    await checkBodyText('Summary log uploaded', 10)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))

    navigationLinks = await HomePage.navLinkElements()
    expect(navigationLinks.length).toBe(0)
  })

  it('Should be able to submit a Exporter Summary Log spreadsheet', async () => {
    await UploadSummaryLogPage.open(
      '6507f1f77bcf86cd79943911',
      '6507f1f77bcf86cd79943913'
    )

    await DefraIdStubPage.login()
    await DefraIdStubPage.selectOrganisation(1)

    await WasteRecordsPage.open(
      '6507f1f77bcf86cd79943911',
      '6507f1f77bcf86cd79943913'
    )
    await WasteRecordsPage.submitSummaryLogLink()

    await UploadSummaryLogPage.uploadFile('resources/exporter.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your file is being uploaded', 10)

    await checkBodyText('Check before confirming upload', 20)
    await UploadSummaryLogPage.confirmAndSubmit()

    await checkBodyText('Your waste records are being updated', 5)

    await checkBodyText('Summary log uploaded', 10)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('Should get an error message with an empty Summary Log spreadsheet', async () => {
    await UploadSummaryLogPage.open(
      '6507f1f77bcf86cd79943911',
      '6507f1f77bcf86cd79943912'
    )

    await DefraIdStubPage.login()
    await DefraIdStubPage.selectOrganisation(1)

    await WasteRecordsPage.open(
      '6507f1f77bcf86cd79943911',
      '6507f1f77bcf86cd79943912'
    )
    await WasteRecordsPage.submitSummaryLogLink()

    // Should not continue without uploading a file
    await UploadSummaryLogPage.continue()
    await expect(browser).toHaveTitle(
      expect.stringContaining('Summary log: upload')
    )

    await UploadSummaryLogPage.uploadFile('resources/empty.xlsx')
    await UploadSummaryLogPage.continue()
    await checkUploadErrorText(
      '#main-content > div > div > div > p.govuk-body.govuk-\\!-font-weight-bold',
      'The selected file is empty',
      5
    )

    // Should not continue without uploading a file
    await UploadSummaryLogPage.continue()
    await checkUploadErrorText(
      '#main-content > div > div > div > p.govuk-body.govuk-\\!-font-weight-bold',
      'The selected file is empty',
      2
    )

    await UploadSummaryLogPage.returnToSubmissionPage()
    await expect(browser).toHaveTitle(
      expect.stringContaining('1 Green Park: Paper')
    )
  })
})
