import { Page } from 'page-objects/page.js'

class RegistrationReprocessorSitePermitPage extends Page {
  async environmental() {
    await super.radioInputElement(1).click()
  }

  async installation() {
    await super.radioInputElement(2).click()
  }

  async wasteExemption() {
    await super.radioInputElement(3).click()
  }
}

export default new RegistrationReprocessorSitePermitPage()
