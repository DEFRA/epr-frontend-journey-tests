import { Page } from '../page.js'

class RegistrationReprocessorWasteFromPage extends Page {
  async details(text) {
    await super.textAreaElement(1).setValue(text)
  }
}

export default new RegistrationReprocessorWasteFromPage()
