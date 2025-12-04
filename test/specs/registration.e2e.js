import { browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import Homepage from 'page-objects/homepage.js'
import UploadSummaryLogPage from '../page-objects/upload.summary.log.page.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import { checkBodyText, checkUploadErrorText } from '../support/checks.js'

describe('Registration', () => {
  it.skip('Should be able to submit Summary Log spreadsheet', async () => {
    await DefraIdStubPage.open()
    await DefraIdStubPage.register()
    await expect(browser).toHaveTitle(
      expect.stringContaining('DEFRA ID Registration')
    )
    await DefraIdStubPage.registerUser()
    await DefraIdStubPage.newUserRelationship({
      id: 'abc',
      orgId: '123',
      orgName: 'Test Org'
    })
    await DefraIdStubPage.newUserRelationship({
      id: 'def',
      orgId: '456',
      orgName: 'Another Org'
    })

    await DefraIdStubPage.finish()

    await Homepage.open()

    let navigationLinks = await Homepage.navLinkElements()
    expect(navigationLinks.length).toBe(1)

    await Homepage.signInLink()

    await DefraIdStubPage.login()
    await DefraIdStubPage.selectOrganisation(1)
    const welcomeText = await Homepage.welcomeText()
    await expect(welcomeText).toEqual('Welcome, Waste Reprocessor')

    navigationLinks = await Homepage.navLinkElements()
    expect(navigationLinks.length).toBeGreaterThan(1)
    const switchOrg = await navigationLinks.find(
      async (link) => (await link.getText()) === 'Switch organisation'
    )
    expect(switchOrg).toBeDefined()

    await WasteRecordsPage.open(
      '6507f1f77bcf86cd79943911',
      '6507f1f77bcf86cd79943912'
    )
    await expect(browser).toHaveTitle(expect.stringContaining('Registration'))
    await WasteRecordsPage.submitSummaryLogLink()
    await expect(browser).toHaveTitle(
      expect.stringContaining('Summary log: upload')
    )
    await UploadSummaryLogPage.uploadFile('resources/summary-log.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your file is being uploaded', 5)
    await checkBodyText('Check before you submit', 10)
    await UploadSummaryLogPage.confirmAndSubmit()

    await checkBodyText(
      'Summary log for accreditation number ACC123456 submitted',
      10
    )

    await Homepage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Home'))

    navigationLinks = await Homepage.navLinkElements()
    expect(navigationLinks.length).toBe(1)
  })

  it('Should get an error message with an empty Summary Log spreadsheet', async () => {
    await UploadSummaryLogPage.open(123, 456)

    const navigationLinks = await Homepage.navLinkElements()
    expect(navigationLinks.length).toBe(1)

    await expect(browser).toHaveTitle(
      expect.stringContaining('Summary log: upload')
    )

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
    await expect(browser).toHaveTitle(expect.stringContaining('Registration'))
  })
})
