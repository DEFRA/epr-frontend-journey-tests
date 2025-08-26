import { Page } from 'page-objects/page.js'

class RegistrationReprocessorSitePermitPage extends Page {
  async aluminium() {
    await super.checkboxInputElement(1).click()
  }

  async fibre() {
    await super.checkboxInputElement(2).click()
  }

  async glass() {
    await super.checkboxInputElement(3).click()
  }

  async paperOrBoard() {
    await super.checkboxInputElement(4).click()
  }

  async plastic() {
    await super.checkboxInputElement(5).click()
  }

  async steel() {
    await super.checkboxInputElement(6).click()
  }

  async wood() {
    await super.checkboxInputElement(7).click()
  }
}

export default new RegistrationReprocessorSitePermitPage()
