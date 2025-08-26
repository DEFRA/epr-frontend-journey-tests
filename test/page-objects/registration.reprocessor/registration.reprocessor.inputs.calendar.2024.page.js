import { Page } from 'page-objects/page.js'

class RegistrationReprocessorInputsCalendar2024Page extends Page {
  async actualFigures() {
    await super.radioInputElement(1).click()
  }

  async estimatedFigures() {
    await super.radioInputElement(2).click()
  }

  async enterTonnages(uk, nonUK, nonPackaging) {
    await super.textInputElement(1).setValue(uk)
    await super.textInputElement(2).setValue(nonUK)
    await super.textInputElement(3).setValue(nonPackaging)
  }
}

export default new RegistrationReprocessorInputsCalendar2024Page()
