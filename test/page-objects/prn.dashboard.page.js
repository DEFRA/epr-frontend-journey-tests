import { browser, $ } from '@wdio/globals'

class PRNDashboardPage {
  open(orgId) {
    return browser.url(`/organisations/${orgId}`)
  }

  async dashboardHeaderText() {
    return $('#main-content > div > div > div > h1').getText()
  }

  async selectAwaitingAuthorisationLink(index) {
    const linkElement = await $(
      '#main-content table.govuk-table:nth-of-type(1) tr:nth-child(' +
        index +
        ') a.govuk-link'
    )
    await linkElement.waitForExist({ timeout: 5000 })
    await linkElement.click()
  }

  async selectAwaitingCancellationLink(index) {
    const linkElement = await $(
      '#main-content table.govuk-table:nth-of-type(2) tr:nth-child(' +
        index +
        ') a.govuk-link'
    )
    await linkElement.waitForExist({ timeout: 5000 })
    await linkElement.click()
  }

  async selectIssuedTab() {
    await $('//a[normalize-space()="Issued"]').click()
  }

  async selectAwaitingActionTab() {
    await $('//a[normalize-space()="Awaiting action"]').click()
  }

  async getAwaitingAuthorisationIssuedTo(rowIndex) {
    const materialElement = await $(
      '#main-content table.govuk-table:nth-of-type(1) tr:nth-child(' +
        rowIndex +
        ') > td:nth-child(1)'
    )
    await materialElement.waitForExist({ timeout: 5000 })
    return await materialElement.getText()
  }

  async getAwaitingCancellationIssuedTo(rowIndex) {
    const materialElement = await $(
      '#main-content table.govuk-table:nth-of-type(2) tr:nth-child(' +
        rowIndex +
        ') > td:nth-child(1)'
    )
    await materialElement.waitForExist({ timeout: 5000 })
    return await materialElement.getText()
  }

  async wasteBalanceAmount() {
    const element = await $('[data-testid="waste-balance-amount"]')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }
}

export default new PRNDashboardPage()
