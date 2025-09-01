import { Page } from 'page-objects/page.js'

class RegistrationReprocessorWasteDetailsPage extends Page {
  async tonnage(number) {
    await $(
      '#main-content > div > div > form > div:nth-child(2) > div > input'
    ).setValue(number)
  }

  async yearly() {
    await $(
      '#main-content > div > div > form > div:nth-child(3) > fieldset > div > div:nth-child(1) > input'
    ).click()
  }

  async monthly() {
    await $(
      '#main-content > div > div > form > div:nth-child(3) > fieldset > div > div:nth-child(2) > input'
    ).click()
  }

  async weekly() {
    await $(
      '#main-content > div > div > form > div:nth-child(3) > fieldset > div > div:nth-child(3) > input'
    ).click()
  }
}

export default new RegistrationReprocessorWasteDetailsPage()
