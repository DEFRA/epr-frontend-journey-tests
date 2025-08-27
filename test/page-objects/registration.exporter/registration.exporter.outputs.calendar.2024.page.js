import { Page } from 'page-objects/page.js'

class RegistrationExporterOutputsCalendar2024Page extends Page {
  async actualFigures() {
    await super.radioInputElement(1).click()
  }

  async estimatedFigures() {
    await super.radioInputElement(2).click()
  }

  async enterTonnages(packaging, contaminants, processLoss) {
    await $(
      '#main-content > div > div > form > div:nth-child(3) > div > input'
    ).setValue(packaging)
    await $(
      '#main-content > div > div > form > div:nth-child(4) > div > input'
    ).setValue(contaminants)
    await $(
      '#main-content > div > div > form > div:nth-child(5) > div > input'
    ).setValue(processLoss)
  }
}

export default new RegistrationExporterOutputsCalendar2024Page()
