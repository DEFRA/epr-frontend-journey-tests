import { browser, $, $$ } from '@wdio/globals'

class DefraIdStubPage {
  constructor() {
    this.baseUrl = 'http://localhost:3200'
  }

  async open() {
    return browser.url(this.baseUrl)
  }

  async register() {
    browser.url(`${this.baseUrl}/cdp-defra-id-stub/register`)
  }

  async registerUser(user) {
    await $('#email').setValue(user.email)
    await $('#firstName').setValue(user.firstName)
    await $('#lastName').setValue(user.lastName)
    await $('#enrolmentCount').setValue('1')
    await $('#enrolmentRequestCount').setValue('1')
    await $('button[type=submit]').click()
  }

  async newUserRelationship(relationship) {
    await $('#relationshipId').setValue(relationship.id)
    await $('#organisationId').setValue(relationship.orgId)
    await $('#organisationName').setValue(relationship.orgName)
    await $('button[type=submit]').click()
  }

  async finish() {
    await $('a*=Finish').click()
  }

  async login(index = 0) {
    await $$('a*=Log in')[index].click()
  }

  async loginViaEmail(email) {
    const selector = `//tr[th[text()="${email}"]]//a`
    await browser.waitUntil(
      async () => {
        const el = await $(selector)
        if (await el.isExisting()) return true
        await browser.refresh()
        return false
      },
      { timeout: 15000, interval: 2000 }
    )
    await $(selector).click()

    // The click triggers an OAuth redirect chain (stub → app callback →
    // dashboard) that sets the userSession cookie on the way through. A
    // caller that issues browser.url(...) next can race the chain and
    // arrive before the cookie lands, so the request hits the app as
    // unauthenticated. Wait until we've left the stub host to guarantee
    // the chain has finished before returning.
    await browser.waitUntil(
      async () => {
        const currentUrl = await browser.getUrl()
        return !currentUrl.includes('defra-id-stub')
      },
      {
        timeout: 15000,
        timeoutMsg: 'Login did not redirect away from defra-id-stub'
      }
    )
  }

  async selectOrganisation(index) {
    const suffix = index === 1 ? '' : `-${index}`
    await $(`#relationshipId${suffix}`).click()
    await $('button[type=submit]').click()
  }
}

export default new DefraIdStubPage()
