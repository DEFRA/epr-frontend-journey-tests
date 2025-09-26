import { Page } from '../page.js'

class OrganisationDetailsRegisteredCharityPage extends Page {
  async yes() {
    await super.radioInputElement(1).click()
  }

  async no() {
    await super.radioInputElement(2).click()
  }
}

export default new OrganisationDetailsRegisteredCharityPage()
