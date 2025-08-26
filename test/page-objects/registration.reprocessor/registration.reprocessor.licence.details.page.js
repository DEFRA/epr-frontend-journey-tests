import { Page } from 'page-objects/page.js'

class RegistrationReprocessorLicenceDetailsPage extends Page {
  async permit(number) {
    await super.textInputElement(1).setValue(number)
  }

  async tonnage(number) {
    await super.textInputElement(2).setValue(number)
  }

  async yearly() {
    await super.radioInputElement(1).click()
  }

  async monthly() {
    await super.radioInputElement(2).click()
  }

  async weekly() {
    await super.radioInputElement(3).click()
  }
}

export default new RegistrationReprocessorLicenceDetailsPage()
