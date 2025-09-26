import { Page } from '../page.js'

class RegistrationReprocessorKeyPlantAndEquipmentPage extends Page {
  async details(text) {
    // #main-content > div > div > form > div.govuk-form-group.govuk-character-count > textarea
    await super.textAreaElement(1).setValue(text)
  }
}

export default new RegistrationReprocessorKeyPlantAndEquipmentPage()
