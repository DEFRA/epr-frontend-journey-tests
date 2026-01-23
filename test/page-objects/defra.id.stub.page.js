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
    await $(`//tr[th[text()="${email}"]]//a`).click()
  }

  async selectOrganisation(index) {
    const suffix = index === 1 ? '' : `-${index}`
    await $(`#relationshipId${suffix}`).click()
    await $('button[type=submit]').click()
  }
}

export default new DefraIdStubPage()
