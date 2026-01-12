import { $, browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import UploadSummaryLogPage from '../page-objects/upload.summary.log.page.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import { checkBodyText, checkUploadErrorText } from '../support/checks.js'

describe('Registration', () => {
  it('Should be able to submit a Reprocessor Input Summary Log spreadsheet', async () => {
    await HomePage.openStart()

    // PAE-743: Site Furniture checks
    const href = await HomePage.getStartNowHref()
    expect(href).toBe('/login')

    const phaseTag = await HomePage.getPhaseTagText()
    expect(phaseTag).toBe('Beta')

    const feedbackHref = await HomePage.getFeedbackLinkHref()
    expect(feedbackHref).toBe('mailto:eprcustomerservice@defra.gov.uk')

    const feedbackText = await HomePage.getFeedbackLinkText()
    expect(feedbackText).toBe('give your feedback by email')

    // Not signed in, navigation links do not display
    let navigationLinks = await HomePage.navLinkElements()
    expect(navigationLinks.length).toBe(0)

    // PAE-743: End of Site Furniture checks

    await HomePage.clickStartNow()

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

    await HomePage.signInLink()

    await DefraIdStubPage.login()
    await DefraIdStubPage.selectOrganisation(1)

    await HomePage.linkRegistration()

    // Signed in, there should be navigation links now
    navigationLinks = await HomePage.navLinkElements()
    expect(navigationLinks.length).toBeGreaterThanOrEqual(1)

    const navLinkTexts = await HomePage.getNavLinkTexts()

    expect(navLinkTexts).toContain('Home')
    expect(navLinkTexts).toContain('Manage account')
    expect(navLinkTexts).toContain('Sign out')

    const homeHref = await HomePage.getNavigationLinkHref('Home')
    expect(homeHref).toContain('/organisations/')

    const dashboardHeaderText = await DashboardPage.dashboardHeaderText()

    expect(dashboardHeaderText).toContain('Eco Recycle')

    await DashboardPage.selectLink(1)

    const regNo = await $('//a[normalize-space()="R25SR500030912PA"]')
    expect(regNo).toExist()

    const accNo = await $('//a[normalize-space()="ACC123456"]')
    expect(accNo).toExist()

    await WasteRecordsPage.submitSummaryLogLink()
    await expect(browser).toHaveTitle(
      expect.stringContaining('Summary log: upload')
    )
    await UploadSummaryLogPage.uploadFile('resources/summary-log.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your file is being checked', 20)

    await checkBodyText('Check before confirming upload', 20)
    await UploadSummaryLogPage.confirmAndSubmit()

    await checkBodyText('Your waste records are being updated', 20)

    await checkBodyText('Summary log uploaded', 10)

    // PAE-743: Sign out link is visible, hence able to sign out
    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))

    navigationLinks = await HomePage.navLinkElements()
    expect(navigationLinks.length).toBe(0)
  })

  it('Should be able to submit a Exporter Summary Log spreadsheet', async () => {
    await HomePage.openStart()
    await HomePage.clickStartNow()

    await DefraIdStubPage.login()
    await DefraIdStubPage.selectOrganisation(1)

    await DashboardPage.selectExportingTab()
    await DashboardPage.selectLink(1)

    const regNo = await $('//a[normalize-space()="E25SR500030913PA"]')
    expect(regNo).toExist()

    const accNo = await $('//a[normalize-space()="ACC234567"]')
    expect(accNo).toExist()

    await WasteRecordsPage.submitSummaryLogLink()

    await UploadSummaryLogPage.uploadFile('resources/exporter.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your file is being checked', 20)

    await checkBodyText('Check before confirming upload', 20)
    await UploadSummaryLogPage.confirmAndSubmit()

    await checkBodyText('Your waste records are being updated', 20)

    await checkBodyText('Summary log uploaded', 10)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('Should get an error message with an empty Summary Log spreadsheet', async () => {
    await HomePage.openStart()
    await HomePage.clickStartNow()

    await DefraIdStubPage.login()
    await DefraIdStubPage.selectOrganisation(1)

    await DashboardPage.selectLink(1)
    await WasteRecordsPage.submitSummaryLogLink()

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
