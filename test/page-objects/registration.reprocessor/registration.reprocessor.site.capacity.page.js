import { Page } from 'page-objects/page.js'

class RegistrationReprocessorSiteCapacityPage extends Page {
  async tonnage(number) {
    await super.textInputElement(1).setValue(number)
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

export default new RegistrationReprocessorSiteCapacityPage()
