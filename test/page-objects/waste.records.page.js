import { browser, $ } from '@wdio/globals'

class WasteRecordsPage {
  open(orgId, regId) {
    return browser.url(`/organisations/${orgId}/registrations/${regId}`)
  }

  submitSummaryLogLink() {
    $('#main-content a').click()
  }
}

export default new WasteRecordsPage()
