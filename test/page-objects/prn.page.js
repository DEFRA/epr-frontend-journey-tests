import { browser, $ } from '@wdio/globals'

class PRNPage {
  open(orgId, regId) {
    return browser.url(
      `/organisations/${orgId}/registrations/${regId}/create-prn`
    )
  }

  async headingText() {
    const headingElement = await $('h1.govuk-heading-xl')

    await headingElement.waitForExist({ timeout: 5000 })
    return await headingElement.getText()
  }

  async enterTonnage(tonnes) {
    await $('#tonnage').setValue(tonnes)
  }

  async select(producer) {
    await $('#recipient').selectByVisibleText(producer)
  }

  async continue() {
    await $('#main-content button[type=submit]').click()
  }

  async addIssuerNotes(notes) {
    await $('#notes').setValue(notes)
  }
}

export default new PRNPage()
