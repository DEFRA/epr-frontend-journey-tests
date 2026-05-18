import { $ } from '@wdio/globals'

const ACTIVE_TABLE_INDEX = 1
const SUBMITTED_TABLE_INDEX = 2

const tableRowSelector = (tableIndex, rowIndex) =>
  `#main-content table.govuk-table:nth-of-type(${tableIndex}) tr:nth-child(${rowIndex})`

const selectActionLink = async (rowIndex, tableIndex) => {
  const linkElement = await $(
    `${tableRowSelector(tableIndex, rowIndex)} a.govuk-link`
  )
  await linkElement.waitForClickable({ timeout: 5000 })
  await linkElement.click()
}

const getStatusBadgeElement = async (rowIndex, tableIndex) => {
  const element = await $(
    `${tableRowSelector(tableIndex, rowIndex)} .govuk-tag`
  )
  await element.waitForExist({ timeout: 5000 })
  return element
}

const getStatusBadge = async (rowIndex, tableIndex) => {
  const element = await getStatusBadgeElement(rowIndex, tableIndex)
  return await element.getText()
}

const getStatusColour = async (rowIndex, tableIndex) => {
  const element = await getStatusBadgeElement(rowIndex, tableIndex)
  const classAttr = (await element.getAttribute('class')) ?? ''
  const match = classAttr.match(/govuk-tag--(\w+)/)
  return match ? match[1] : 'blue'
}

class ReportsPage {
  async headingText() {
    const element = await $('h1.govuk-heading-l')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async selectActiveActionLink(rowIndex) {
    await selectActionLink(rowIndex, ACTIVE_TABLE_INDEX)
  }

  async selectSubmittedActionLink(rowIndex) {
    await selectActionLink(rowIndex, SUBMITTED_TABLE_INDEX)
  }

  async getActiveStatusBadge(rowIndex) {
    return await getStatusBadge(rowIndex, ACTIVE_TABLE_INDEX)
  }

  async getSubmittedStatusBadge(rowIndex) {
    return await getStatusBadge(rowIndex, SUBMITTED_TABLE_INDEX)
  }

  async getActiveStatusColour(rowIndex) {
    return await getStatusColour(rowIndex, ACTIVE_TABLE_INDEX)
  }

  async getSubmittedStatusColour(rowIndex) {
    return await getStatusColour(rowIndex, SUBMITTED_TABLE_INDEX)
  }
}

export default new ReportsPage()
