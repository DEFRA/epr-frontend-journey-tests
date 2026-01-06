import { browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'

describe('Start Page (PAE-777)', () => {
  describe('Unauthenticated users', () => {
    it('should redirect from / to /start', async () => {
      await HomePage.open()
      await browser.waitUntil(
        async () => (await browser.getUrl()).includes('/start'),
        {
          timeout: 5000,
          timeoutMsg: 'Expected URL to redirect to /start'
        }
      )
      const url = await browser.getUrl()
      expect(url).toContain('/start')
    })

    it('should display the start page at /start', async () => {
      await HomePage.openStart()
      await expect(browser).toHaveTitle(expect.stringContaining('Home'))
    })

    it('should have Start Now button linking to /login', async () => {
      await HomePage.openStart()
      const href = await HomePage.getStartNowHref()
      expect(href).toBe('/login')
    })
  })

  describe('Authenticated users with linked organisation', () => {
    it('should redirect to organisation home after login and linking', async () => {
      // Setup: Register user with Defra ID stub
      await DefraIdStubPage.open()
      await DefraIdStubPage.register()
      await DefraIdStubPage.registerUser()
      await DefraIdStubPage.newUserRelationship({
        id: 'relationshipId',
        orgId: '2dee1e31-5ac6-4bc4-8fe0-0820f710c2b1',
        orgName: 'ACME ltd'
      })
      await DefraIdStubPage.finish()

      // Navigate to start page and click Start Now
      await HomePage.openStart()
      await HomePage.clickStartNow()
      await DefraIdStubPage.login()
      await DefraIdStubPage.selectOrganisation(1)

      // Should be redirected to account linking
      await browser.waitUntil(
        async () => (await browser.getUrl()).includes('/account/linking'),
        {
          timeout: 10000,
          timeoutMsg: 'Expected redirect to account linking'
        }
      )

      // Link the organisation
      await HomePage.linkRegistration()

      // Should redirect to organisation home
      await browser.waitUntil(
        async () => (await browser.getUrl()).includes('/organisations/'),
        {
          timeout: 10000,
          timeoutMsg: 'Expected redirect to organisation home after linking'
        }
      )
      const url = await browser.getUrl()
      expect(url).toContain('/organisations/')

      // Start Now button should now link to organisation home
      await HomePage.openStart()
      const href = await HomePage.getStartNowHref()
      expect(href).toContain('/organisations/')

      // Cleanup
      await HomePage.signOut()
    })
  })

  describe('Welsh language support', () => {
    it('should redirect from /cy to /cy/start', async () => {
      await HomePage.open('/cy')
      await browser.waitUntil(
        async () => (await browser.getUrl()).includes('/cy/start'),
        {
          timeout: 5000,
          timeoutMsg: 'Expected URL to redirect to /cy/start'
        }
      )
      const url = await browser.getUrl()
      expect(url).toContain('/cy/start')
    })

    it('should display the Welsh start page', async () => {
      await HomePage.openStart('/cy')
      const lang = await browser.$('html').getAttribute('lang')
      expect(lang).toBe('cy')
    })
  })
})
