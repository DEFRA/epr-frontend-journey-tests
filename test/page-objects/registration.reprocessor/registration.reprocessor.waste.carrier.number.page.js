import { Page } from 'page-objects/page.js'

class RegistrationReprocessorWasteCarrierNumberPage extends Page {
  async regNumber(number) {
    await super.textInputElement(1).setValue(number)
  }
}

export default new RegistrationReprocessorWasteCarrierNumberPage()
