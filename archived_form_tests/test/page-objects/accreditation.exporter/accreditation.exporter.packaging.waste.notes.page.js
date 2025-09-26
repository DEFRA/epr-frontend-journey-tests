import { Page } from '../page.js'

class AccreditationExporterWasteNotesPage extends Page {
  async fiveHundredTonnes() {
    await super.radioInputElement(1).click()
  }

  async fiveThousandTonnes() {
    await super.radioInputElement(2).click()
  }

  async tenThousandTonnes() {
    await super.radioInputElement(3).click()
  }

  async overTenThousandTonnes() {
    await super.radioInputElement(4).click()
  }
}

export default new AccreditationExporterWasteNotesPage()
