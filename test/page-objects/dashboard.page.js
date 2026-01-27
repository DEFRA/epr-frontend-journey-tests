import { browser, $ } from '@wdio/globals'

class DashboardPage {
  open(orgId) {
    return browser.url(`/organisations/${orgId}`)
  }

  async dashboardHeaderText() {
    return $('#main-content > div > div > div > h1').getText()
  }

  async selectLink(index) {
    const linkElement = await $(
      '#main-content table.govuk-table tr:nth-child(' + index + ') a.govuk-link'
    )
    await linkElement.waitForExist({ timeout: 5000 })
    await linkElement.click()
  }

  async selectTableLink(tableIndex, index) {
    const linkElement = await $(
      '#main-content table.govuk-table:nth-of-type(' +
        tableIndex +
        ') tr:nth-child(' +
        index +
        ') a.govuk-link'
    )
    await linkElement.waitForExist({ timeout: 5000 })
    await linkElement.click()
  }

  async availableWasteBalance(index) {
    const wasteBalanceElement = await $(
      '#main-content table.govuk-table tr:nth-child(' +
        index +
        ') > td.govuk-table__cell.govuk-table__cell--numeric'
    )
    await wasteBalanceElement.waitForExist({ timeout: 5000 })
    return await wasteBalanceElement.getText()
  }

  async selectExportingTab() {
    const linkElement = $('//a[normalize-space()="Exporting"]').click()
    await linkElement.waitForExist({ timeout: 5000 })
    await linkElement.click()
  }

  async getMaterial(tableIndex, rowIndex) {
    const materialElement = await $(
      '#main-content table.govuk-table:nth-of-type(' +
        tableIndex +
        ') tr:nth-child(' +
        rowIndex +
        ') > td:nth-child(1)'
    )
    await materialElement.waitForExist({ timeout: 5000 })
    return await materialElement.getText()
  }
}

export default new DashboardPage()
