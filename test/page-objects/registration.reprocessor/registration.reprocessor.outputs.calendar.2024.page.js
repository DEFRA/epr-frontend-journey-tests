import { Page } from 'page-objects/page.js'

class RegistrationReprocessorOutputsCalendar2024Page extends Page {
  async actualFigures() {
    await super.radioInputElement(1).click()
  }

  async estimatedFigures() {
    await super.radioInputElement(2).click()
  }

  async enterTonnages(packaging, contaminants, processLoss) {
    await super.textInputElement(1).setValue(packaging)
    await super.textInputElement(2).setValue(contaminants)
    await super.textInputElement(3).setValue(processLoss)
  }
}

export default new RegistrationReprocessorOutputsCalendar2024Page()
