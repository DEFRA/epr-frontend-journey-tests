import { browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import SiteFurniturePage from 'page-objects/site-furniture.page.js'

describe('Site Furniture - Header (PAE-743)', () => {
  describe('Phase Banner', () => {
    it('Should display Beta tag', async () => {
      await HomePage.openStart()
      const phaseTag = await SiteFurniturePage.getPhaseTagText()
      expect(phaseTag).toBe('Beta')
    })

    it('Should have feedback mailto link', async () => {
      await HomePage.openStart()
      const feedbackHref = await SiteFurniturePage.getFeedbackLinkHref()
      expect(feedbackHref).toBe('mailto:eprcustomerservice@defra.gov.uk')
    })

    it('Should display correct feedback link text', async () => {
      await HomePage.openStart()
      const feedbackText = await SiteFurniturePage.getFeedbackLinkText()
      expect(feedbackText).toBe('give your feedback by email')
    })
  })

  describe('Service Name Link', () => {
    it('Should link to /start', async () => {
      await HomePage.openStart()
      const href = await SiteFurniturePage.getServiceNameHref()
      expect(href).toBe('/start')
    })

    it('Should navigate to /start when clicked', async () => {
      await HomePage.openStart()
      await SiteFurniturePage.clickServiceName()
      await browser.waitUntil(
        async () => (await browser.getUrl()).includes('/start'),
        {
          timeout: 5000,
          timeoutMsg: 'Expected navigation to /start'
        }
      )
      const url = await browser.getUrl()
      expect(url).toContain('/start')
    })
  })

  describe('Navigation (unauthenticated)', () => {
    it('Should not display navigation links when not logged in', async () => {
      await HomePage.openStart()
      const navLinks = await HomePage.navLinkElements()
      expect(navLinks.length).toBe(0)
    })
  })

  describe('Navigation (authenticated)', () => {
    beforeEach(async () => {
      // Follow the same flow as registration.e2e.js which is proven to work
      await HomePage.openStart()
      await HomePage.clickStartNow()

      // Now on Defra ID Registration page - register a new user
      await DefraIdStubPage.registerUser()
      await DefraIdStubPage.newUserRelationship({
        id: 'relationshipId',
        orgId: '2dee1e31-5ac6-4bc4-8fe0-0820f710c2b1',
        orgName: 'ACME ltd'
      })
      // Add second relationship so the selection page appears
      await DefraIdStubPage.newUserRelationship({
        id: 'dummy-relationship',
        orgId: 'dummy-org-id',
        orgName: 'Dummy Organisation'
      })
      await DefraIdStubPage.finish()

      // Go to homepage and sign in as the registered user
      await HomePage.open()
      await HomePage.signInLink()
      await DefraIdStubPage.login()
      await DefraIdStubPage.selectOrganisation(1)

      // Link organisation
      await HomePage.linkRegistration()

      // Wait for redirect to organisation home
      await browser.waitUntil(
        async () => (await browser.getUrl()).includes('/organisations/'),
        {
          timeout: 10000,
          timeoutMsg: 'Expected redirect to organisation home after linking'
        }
      )
    })

    afterEach(async () => {
      // Cleanup: Sign out
      try {
        await HomePage.signOut()
      } catch {
        // Ignore errors during cleanup
      }
    })

    it('Should display navigation links when logged in', async () => {
      const navLinks = await HomePage.navLinkElements()
      expect(navLinks.length).toBeGreaterThan(0)
    })

    it('Should display Home link when user has linked organisation', async () => {
      const navTexts = await SiteFurniturePage.getNavigationLinkTexts()
      expect(navTexts).toContain('Home')
    })

    it('Should have Home link pointing to organisation page', async () => {
      const homeHref = await SiteFurniturePage.getNavigationLinkHref('Home')
      expect(homeHref).toContain('/organisations/')
    })

    it('Should display Manage account link', async () => {
      const navTexts = await SiteFurniturePage.getNavigationLinkTexts()
      expect(navTexts).toContain('Manage account')
    })

    it('Should display Sign out link', async () => {
      const navTexts = await SiteFurniturePage.getNavigationLinkTexts()
      expect(navTexts).toContain('Sign out')
    })

    it('Should navigate Home link to organisation page', async () => {
      await SiteFurniturePage.clickNavigationLink('Home')
      await browser.waitUntil(
        async () => (await browser.getUrl()).includes('/organisations/'),
        {
          timeout: 5000,
          timeoutMsg: 'Expected navigation to organisation page'
        }
      )
      const url = await browser.getUrl()
      expect(url).toContain('/organisations/')
    })

    it('Should log out when Sign out is clicked', async () => {
      await SiteFurniturePage.clickNavigationLink('Sign out')
      await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))

      // Verify navigation links are no longer visible
      const navLinks = await HomePage.navLinkElements()
      expect(navLinks.length).toBe(0)
    })
  })
})
