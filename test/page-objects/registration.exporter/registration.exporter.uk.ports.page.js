import { Page } from 'page-objects/page.js'

class RegistrationExporterUKPortsPage extends Page {
  async enter(port) {
    await super.textInputElement(1).setValue(port)
  }
}

export default new RegistrationExporterUKPortsPage()
