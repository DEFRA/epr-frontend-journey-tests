import { browser, $, $$ } from '@wdio/globals'

class CreatePRNPage {
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

  async materialDetails() {
    return await $('#main-content > div > div > form > p').getText()
  }

  async errorMessages() {
    await browser.waitUntil(
      async () => {
        const elements = await $$('#main-content div[role=alert] ul li a')
        return elements.length > 0
      },
      {
        timeout: 5000,
        timeoutMsg: 'Expected to find error list items'
      }
    )
    const errorLinks = await $$('#main-content div[role=alert] ul li a')
    return await errorLinks.map((el) => el.getText())
  }
}

export default new CreatePRNPage()
