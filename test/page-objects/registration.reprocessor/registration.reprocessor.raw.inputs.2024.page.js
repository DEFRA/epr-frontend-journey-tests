import { Page } from 'page-objects/page.js'

class RegistrationReprocessorRawInputs2024Page extends Page {
  async enterDetails(rawMaterial, tonnage) {
    await super.textInputElement(1).setValue(rawMaterial)
    await super.textInputElement(2).setValue(tonnage)
  }
}

export default new RegistrationReprocessorRawInputs2024Page()
