import { Page } from 'page-objects/page.js'

class RegistrationReprocessorKeyPlantAndEquipmentPage extends Page {
  async details(text) {
    await super.textAreaElement(1).setValue(text)
  }
}

export default new RegistrationReprocessorKeyPlantAndEquipmentPage()
