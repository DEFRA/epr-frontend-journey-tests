import { Page } from '../page.js'

class RegistrationReprocessorWhatAddressRegulatorServesToPage extends Page {
  async enterAddress(address) {
    await super.textInputElement(1).setValue(address.line1)
    await super.textInputElement(2).setValue(address.line2)
    await super.textInputElement(3).setValue(address.town)
    await super.textInputElement(4).setValue(address.county)
    await super.textInputElement(5).setValue(address.postcode)
  }
}

export default new RegistrationReprocessorWhatAddressRegulatorServesToPage()
