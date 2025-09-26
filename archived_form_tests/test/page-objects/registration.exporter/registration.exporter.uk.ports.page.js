import { Page } from '../page.js'

class RegistrationExporterUKPortsPage extends Page {
  async enter(port) {
    await super.textAreaElement(1).setValue(port)
  }
}

export default new RegistrationExporterUKPortsPage()
