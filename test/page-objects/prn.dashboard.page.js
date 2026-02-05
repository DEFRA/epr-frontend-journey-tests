import { $, $$ } from '@wdio/globals'

class PRNDashboardPage {
  async dashboardHeaderText() {
    return $('#main-content > div > div > div > h1').getText()
  }

  async selectAwaitingAuthorisationLink(index) {
    const linkElement = await $(
      '#main-content table.govuk-table tr:nth-child(' + index + ') a.govuk-link'
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

  async getAwaitingAuthorisationRow(rowIndex) {
    const authRow = new Map()
    const tableHeaders = await $$(
      '#main-content table.govuk-table > thead > tr th'
    )
    const headerText = await tableHeaders.map((element) => {
      return element.getText()
    })

    const tableData = await $$(
      '#main-content table.govuk-table > tbody > tr:nth-child(' +
        rowIndex +
        ') td'
    )

    const rowText = await tableData.map((element) => {
      return element.getText()
    })

    for (let i = 0; i < headerText.length; i++) {
      authRow.set(headerText[i], rowText[i])
    }
    return authRow
  }

  async cancelHintText() {
    return await $('#main-content div.govuk-inset-text').getText()
  }

  async selectPrnHeadingText() {
    return await $('#main-content > div > div > h2').getText()
  }

  async getNoPrnMessage() {
    return await $('#awaiting-action > p').getText()
  }

  async wasteBalanceAmount() {
    const element = await $('[data-testid="waste-balance-amount"]')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async selectBackLink() {
    await $('a*=Back').click()
  }

  async createAPrnButton() {
    await $(
      '#main-content div.epr-heading-with-action > a[data-module="govuk-button"]'
    ).click()
  }
}

export default new PRNDashboardPage()
