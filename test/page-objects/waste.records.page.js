import { browser, $ } from '@wdio/globals'

class WasteRecordsPage {
  open(orgId, regId) {
    return browser.url(`/organisations/${orgId}/registrations/${regId}`)
  }

  async submitSummaryLogLink() {
    await $('a*=Upload your summary log').click()
  }
}

export default new WasteRecordsPage()
