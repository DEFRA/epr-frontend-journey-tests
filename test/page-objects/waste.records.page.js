import { browser, $ } from '@wdio/globals'

class WasteRecordsPage {
  open(orgId, regId) {
    return browser.url(`/organisations/${orgId}/registrations/${regId}`)
  }

  async submitSummaryLogLink() {
    await $(
      '#main-content > div > div > div > div:nth-child(6) > div:nth-child(1) > div > div.govuk-summary-card__content > p > a'
    ).click()
  }
}

export default new WasteRecordsPage()
