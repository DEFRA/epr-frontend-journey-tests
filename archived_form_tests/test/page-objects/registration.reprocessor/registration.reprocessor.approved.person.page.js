import { Page } from '../page.js'

class RegistrationReprocessorApprovedPersonPage extends Page {
  async details(approvedPerson) {
    await $(
      '#main-content > div > div > form > div:nth-child(3) > input'
    ).setValue(approvedPerson.name)
    await $(
      '#main-content > div > div > form > div:nth-child(4) > input'
    ).setValue(approvedPerson.email)
    await $(
      '#main-content > div > div > form > div:nth-child(5) > input'
    ).setValue(approvedPerson.telephone)
  }

  async director() {
    await super.radioInputElement(1).click()
  }

  async secretary() {
    await super.radioInputElement(2).click()
  }

  async partner() {
    await super.radioInputElement(3).click()
  }

  async soleTrader() {
    await super.radioInputElement(4).click()
  }
}

export default new RegistrationReprocessorApprovedPersonPage()
