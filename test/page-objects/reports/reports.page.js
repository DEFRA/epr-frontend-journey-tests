import { $ } from '@wdio/globals'

class ReportsPage {
  async headingText() {
    const element = await $('h1.govuk-heading-l')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async selectActionLink(rowIndex, tableIndex = 1) {
    const linkElement = await $(
      `#main-content table.govuk-table:nth-of-type(${tableIndex}) tr:nth-child(${rowIndex}) a.govuk-link`
    )
    await linkElement.waitForExist({ timeout: 5000 })
    await linkElement.click()
  }

  async getStatusBadge(rowIndex, tableIndex = 1) {
    const element = await $(
      `#main-content table.govuk-table:nth-of-type(${tableIndex}) tr:nth-child(${rowIndex}) .govuk-tag`
    )
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }
}

export default new ReportsPage()
