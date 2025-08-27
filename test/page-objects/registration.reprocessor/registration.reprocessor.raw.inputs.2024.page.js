import { Page } from 'page-objects/page.js'

class RegistrationReprocessorRawInputs2024Page extends Page {
  async enterDetails(rawMaterial, tonnage) {
    await $(
      '#main-content > div > div > form > div:nth-child(3) > input'
    ).setValue(rawMaterial)
    await $(
      '#main-content > div > div > form > div:nth-child(4) > div.govuk-input__wrapper > input'
    ).setValue(tonnage)
  }
}

export default new RegistrationReprocessorRawInputs2024Page()
