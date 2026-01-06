import { browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'

describe('Auth Callback Redirects (PAE-757)', () => {
  it('should redirect to account linking page when organisation not linked', async () => {
    // Setup: Register user with Defra ID stub
    await DefraIdStubPage.open()
    await DefraIdStubPage.register()
    await DefraIdStubPage.registerUser()
    await DefraIdStubPage.newUserRelationship({
      id: 'unlinked-relationship',
      orgId: 'unlinked-org-id',
      orgName: 'Unlinked Organisation'
    })
    await DefraIdStubPage.finish()

    // Login flow
    await HomePage.openStart()
    await HomePage.clickStartNow()
    await DefraIdStubPage.login()
    await DefraIdStubPage.selectOrganisation(1)

    // Should redirect to account linking
    await browser.waitUntil(
      async () => (await browser.getUrl()).includes('/account/linking'),
      {
        timeout: 10000,
        timeoutMsg:
          'Expected redirect to /account/linking for unlinked organisation'
      }
    )
    const url = await browser.getUrl()
    expect(url).toContain('/account/linking')
  })

  it('should redirect to organisation home after linking', async () => {
    // Continuing from previous test state - link the organisation
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

    // Cleanup
    await HomePage.signOut()
  })

  it('should redirect directly to organisation home when already linked', async () => {
    // Setup: Register new user and complete full linking flow
    await DefraIdStubPage.open()
    await DefraIdStubPage.register()
    await DefraIdStubPage.registerUser()
    await DefraIdStubPage.newUserRelationship({
      id: 'pre-linked-relationship',
      orgId: '2dee1e31-5ac6-4bc4-8fe0-0820f710c2b1',
      orgName: 'Pre-Linked Organisation'
    })
    await DefraIdStubPage.finish()

    // First login and link
    await HomePage.openStart()
    await HomePage.clickStartNow()
    await DefraIdStubPage.login()
    await DefraIdStubPage.selectOrganisation(1)

    await browser.waitUntil(
      async () => (await browser.getUrl()).includes('/account/linking'),
      {
        timeout: 10000,
        timeoutMsg: 'Expected redirect to account linking'
      }
    )
    await HomePage.linkRegistration()

    await browser.waitUntil(
      async () => (await browser.getUrl()).includes('/organisations/'),
      {
        timeout: 10000,
        timeoutMsg: 'Expected redirect to organisation home'
      }
    )

    // Sign out and sign back in
    await HomePage.signOut()

    await HomePage.openStart()
    await HomePage.clickStartNow()
    await DefraIdStubPage.login()
    await DefraIdStubPage.selectOrganisation(1)

    // Should now redirect directly to organisation home
    await browser.waitUntil(
      async () => (await browser.getUrl()).includes('/organisations/'),
      {
        timeout: 10000,
        timeoutMsg:
          'Expected direct redirect to organisation home for linked user'
      }
    )
    const url = await browser.getUrl()
    expect(url).toContain('/organisations/')

    // Cleanup
    await HomePage.signOut()
  })
})
