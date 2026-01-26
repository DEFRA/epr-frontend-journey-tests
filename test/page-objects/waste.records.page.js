import { browser, $ } from '@wdio/globals'

class WasteRecordsPage {
  open(orgId, regId) {
    return browser.url(`/organisations/${orgId}/registrations/${regId}`)
  }

  async dashboardHeaderText() {
    return $('#main-content > div > div > div > h1').getText()
  }

  async submitSummaryLogLink() {
    await $('a*=Upload your summary log').click()
  }

  async createNewPRNLink() {
    await $('a*=Create new PRN')
  }

  async createNewPERNLink() {
    await $('a*=Create new PERN')
  }

  async wasteBalanceAmount() {
    const element = await $('[data-testid="waste-balance-amount"]')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }
}

export default new WasteRecordsPage()
