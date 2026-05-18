import { $ } from '@wdio/globals'

const ACTIVE_HEADING = 'Action required'
const SUBMITTED_HEADING = 'Submitted'

const tableAfterHeadingXPath = (heading) =>
  `//h3[normalize-space()='${heading}']/following-sibling::table[contains(@class,'govuk-table')][1]`

const rowXPath = (tableXPath, rowIndex) =>
  `${tableXPath}//tbody/tr[${rowIndex}]`

const selectActionLink = async (rowIndex, tableXPath) => {
  const linkElement = await $(
    `${rowXPath(tableXPath, rowIndex)}//a[contains(@class,'govuk-link')]`
  )
  await linkElement.waitForClickable({ timeout: 5000 })
  await linkElement.click()
}

const getStatusBadgeElement = async (rowIndex, tableXPath) => {
  const element = await $(
    `${rowXPath(tableXPath, rowIndex)}//*[contains(@class,'govuk-tag')]`
  )
  await element.waitForExist({ timeout: 5000 })
  return element
}

const getStatusBadge = async (rowIndex, tableXPath) => {
  const element = await getStatusBadgeElement(rowIndex, tableXPath)
  return await element.getText()
}

const getStatusColour = async (rowIndex, tableXPath) => {
  const element = await getStatusBadgeElement(rowIndex, tableXPath)
  const classAttr = (await element.getAttribute('class')) ?? ''
  const match = classAttr.match(/govuk-tag--(\w+)/)
  return match ? match[1] : 'blue'
}

const activeTableXPath = tableAfterHeadingXPath(ACTIVE_HEADING)
const submittedTableXPath = tableAfterHeadingXPath(SUBMITTED_HEADING)

class ReportsPage {
  async headingText() {
    const element = await $('h1.govuk-heading-l')
    await element.waitForExist({ timeout: 5000 })
    return await element.getText()
  }

  async selectActiveActionLink(rowIndex) {
    await selectActionLink(rowIndex, activeTableXPath)
  }

  async selectSubmittedActionLink(rowIndex) {
    await selectActionLink(rowIndex, submittedTableXPath)
  }

  async getActiveStatusBadge(rowIndex) {
    return await getStatusBadge(rowIndex, activeTableXPath)
  }

  async getSubmittedStatusBadge(rowIndex) {
    return await getStatusBadge(rowIndex, submittedTableXPath)
  }

  async getActiveStatusColour(rowIndex) {
    return await getStatusColour(rowIndex, activeTableXPath)
  }

  async getSubmittedStatusColour(rowIndex) {
    return await getStatusColour(rowIndex, submittedTableXPath)
  }
}

export default new ReportsPage()
