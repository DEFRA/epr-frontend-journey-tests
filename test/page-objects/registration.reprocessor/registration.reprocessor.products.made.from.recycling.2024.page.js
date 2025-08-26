import { Page } from 'page-objects/page.js'

class RegistrationReprocessorProductsMadeFromRecycling2024Page extends Page {
  async enterTonnages(products, tonnage) {
    await super.textInputElement(1).setValue(products)
    await super.textInputElement(2).setValue(tonnage)
  }
}

export default new RegistrationReprocessorProductsMadeFromRecycling2024Page()
