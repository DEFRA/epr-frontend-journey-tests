import { Page } from 'page-objects/page.js'

class RegistrationExporterOrganisationIdPage extends Page {
  async yes() {
    await super.radioInputElement(1).click()
  }

  async no() {
    await super.radioInputElement(2).click()
  }
}

export default new RegistrationExporterOrganisationIdPage()
