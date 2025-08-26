import { Page } from 'page-objects/page.js'

class RegistrationReprocessorApprovedPersonPage extends Page {
  async details(approvedPerson) {
    await super.textInputElement(1).setValue(approvedPerson.name)
    await super.textInputElement(1).setValue(approvedPerson.email)
    await super.textInputElement(1).setValue(approvedPerson.telephone)
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
