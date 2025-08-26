import { Page } from 'page-objects/page.js'

class RegistrationReprocessorWasteCategoryPage extends Page {
  async aluminium() {
    await super.radioInputElement(1).click()
  }

  async fibre() {
    await super.radioInputElement(2).click()
  }

  async glass() {
    await super.radioInputElement(3).click()
  }

  async paperOrBoard() {
    await super.radioInputElement(4).click()
  }

  async plastic() {
    await super.radioInputElement(5).click()
  }

  async steel() {
    await super.radioInputElement(6).click()
  }

  async wood() {
    await super.radioInputElement(7).click()
  }
}

export default new RegistrationReprocessorWasteCategoryPage()
