import { browser, $ } from '@wdio/globals'

class ReportsPage {
  open(orgId, regId) {
    return browser.url(`/reports/${orgId}/registrations/${regId}`)
  }

  async selectLink() {
    await $('a*=Select').click()
  }

  async selectBackLink() {
    await $('a*=Back').click()
  }
}

export default new ReportsPage()
