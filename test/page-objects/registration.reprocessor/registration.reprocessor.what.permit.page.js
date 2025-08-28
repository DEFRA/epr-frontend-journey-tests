import { Page } from 'page-objects/page.js'

class RegistrationReprocessorSitePermitPage extends Page {
  async environmental() {
    await super.checkboxInputElement(1).click()
  }

  async installation() {
    await super.checkboxInputElement(2).click()
  }

  async wasteExemption() {
    await super.checkboxInputElement(3).click()
  }
}

export default new RegistrationReprocessorSitePermitPage()
