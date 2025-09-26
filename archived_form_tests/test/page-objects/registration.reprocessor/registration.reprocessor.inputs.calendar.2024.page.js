import { Page } from '../page.js'

class RegistrationReprocessorInputsCalendar2024Page extends Page {
  async actualFigures() {
    await super.radioInputElement(1).click()
  }

  async estimatedFigures() {
    await super.radioInputElement(2).click()
  }

  async enterTonnages(uk, nonUK, nonPackaging) {
    await $(
      '#main-content > div > div > form > div:nth-child(4) > div > input'
    ).setValue(uk)
    await $(
      '#main-content > div > div > form > div:nth-child(5) > div > input'
    ).setValue(nonUK)
    await $(
      '#main-content > div > div > form > div:nth-child(6) > div > input'
    ).setValue(nonPackaging)
  }
}

export default new RegistrationReprocessorInputsCalendar2024Page()
