import { Page } from '../page.js'
import { $ } from '@wdio/globals'

class RegistrationReprocessorReprocessingSiteDetailsPage extends Page {
  async enterAddress(address) {
    await super.fieldsetTextInputElement(1).setValue(address.line1)
    await super.fieldsetTextInputElement(2).setValue(address.line2)
    await super.fieldsetTextInputElement(3).setValue(address.town)
    await super.fieldsetTextInputElement(4).setValue(address.county)
    await super.fieldsetTextInputElement(5).setValue(address.postcode)
  }

  async enterGridReference(gridReference) {
    await $(
      '#main-content > div > div > form > div:nth-child(3) > input'
    ).setValue(gridReference)
  }

  async yes() {
    await super.radioInputElement(1).click()
  }

  async no() {
    await super.radioInputElement(2).click()
  }
}

export default new RegistrationReprocessorReprocessingSiteDetailsPage()
