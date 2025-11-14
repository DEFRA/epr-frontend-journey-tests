import { browser, $ } from '@wdio/globals'

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

  async registerUser() {
    await $('#email').setValue('reprocessor@test.gov.uk')
    await $('#firstName').setValue('Waste')
    await $('#lastName').setValue('Reprocessor')
    await $('#enrolmentCount').setValue('1')
    await $('#enrolmentRequestCount').setValue('1')
    await $('button[type=submit]').click()
  }

  async newUserRelationship(relationship) {
    await $('#relationshipId').setValue(relationship.id) // 'abc'
    await $('#organisationId').setValue(relationship.orgId) // '123'
    await $('#organisationName').setValue(relationship.orgName) // 'Test Org'
    await $('button[type=submit]').click()
  }

  async finish() {
    await $(
      '#main-content > div:nth-child(2) > div > div > form > div:nth-child(6) > a:nth-child(2)'
    ).click()
  }

  async login() {
    await $(
      '#main-content > div:nth-child(2) > div > div > table > tbody > tr > td:nth-child(2) > a'
    ).click()
  }

  async selectOrganisation(index) {
    const suffix = index === 1 ? '' : `-${index}`
    await $(`#relationshipId${suffix}`).click()
    await $('button[type=submit]').click()
  }
}

export default new DefraIdStubPage()
