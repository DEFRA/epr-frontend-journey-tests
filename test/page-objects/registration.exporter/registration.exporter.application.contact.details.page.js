import { Page } from 'page-objects/page.js'

class RegistrationExporterApplicationContactDetailsPage extends Page {
  async enterDetails(formDetail) {
    await super.textInputElement(1).setValue(formDetail.fullName)
    await super.textInputElement(2).setValue(formDetail.email)
    await super.textInputElement(3).setValue(formDetail.telephone)
    await super.textInputElement(4).setValue(formDetail.jobTitle)
  }
}

export default new RegistrationExporterApplicationContactDetailsPage()
