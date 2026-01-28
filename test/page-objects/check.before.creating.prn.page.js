import { browser, $, $$ } from '@wdio/globals'

class CheckBeforeCreatingPRNPage {
  open(orgId, regId) {
    return browser.url(
      `/organisations/${orgId}/registrations/${regId}/create-prn/check`
    )
  }

  async headingText() {
    const element = await $('h1.govuk-heading-xl')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async prnDetails() {
    const summaryRows = await $$(
      'dl.govuk-summary-list:nth-of-type(1) > div.govuk-summary-list__row'
    )
    return await this.toDataMap(summaryRows)
  }

  async accreditationDetails() {
    const summaryRows = await $$(
      'dl.govuk-summary-list:nth-of-type(2) > div.govuk-summary-list__row'
    )
    return await this.toDataMap(summaryRows)
  }

  async toDataMap(summaryRows) {
    const dataMap = {}

    for (const row of summaryRows) {
      const key = await row.$('.govuk-summary-list__key').getText()
      const value = await row.$('.govuk-summary-list__value').getText()
      dataMap[key] = value
    }
    return dataMap
  }

  async createPRN() {
    await $('#main-content button[type=submit]').click()
  }

  async cancelWithoutSaving() {
    await $('#main-content div.govuk-button-group a[role=button]').click()
  }
}

export default new CheckBeforeCreatingPRNPage()
