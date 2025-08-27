import { Page } from 'page-objects/page.js'

class RegistrationReprocessorProductsMadeFromRecycling2024Page extends Page {
  async enterTonnages(products, tonnage) {
    await $(
      '#main-content > div > div > form > div:nth-child(3) > input'
    ).setValue(products)
    await $(
      '#main-content > div > div > form > div:nth-child(4) > div.govuk-input__wrapper > input'
    ).setValue(tonnage)
  }
}

export default new RegistrationReprocessorProductsMadeFromRecycling2024Page()
