import { Page } from 'page-objects/page.js'

class RegistrationReprocessorSamplingAndInspectionPage extends Page {
  async uploadFile() {
    await super.radioInputElement(1).click()
  }
}

export default new RegistrationReprocessorSamplingAndInspectionPage()
