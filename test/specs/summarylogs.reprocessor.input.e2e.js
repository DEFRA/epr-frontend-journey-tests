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
  updateMigratedOrganisation
} from '../support/apicalls.js'

describe('Summary Logs Reprocessor Input', () => {
  it('Should be able to link a user to an organisation and submit a spreadsheet @reproInput', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor' }
    ])

    const userEmail = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'input',
          regNumber: 'R25SR500030912PA',
          accNumber: 'ACC123456',
          status: 'approved'
        }
      ]
    )

    await createAndRegisterDefraIdUser(userEmail, 2)

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

    await DefraIdStubPage.loginViaEmail(userEmail)
    await DefraIdStubPage.selectOrganisation(1)

    // Tests the linking of an organisation
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

    expect(dashboardHeaderText).toContain(
      organisationDetails.organisation.companyName
    )

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

    await checkBodyText('Your file is being checked', 30)

    await checkBodyText('Check before confirming upload', 30)
    await UploadSummaryLogPage.confirmAndSubmit()

    await checkBodyText('Your waste records are being updated', 30)

    await checkBodyText('Summary log uploaded', 30)

    // PAE-743: Sign out link is visible, hence able to sign out
    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))

    navigationLinks = await HomePage.navLinkElements()
    expect(navigationLinks.length).toBe(0)
  })
})
