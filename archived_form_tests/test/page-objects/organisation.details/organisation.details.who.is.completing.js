import { Page } from '../page.js'

class OrganisationDetailsWhoIsCompletingPage extends Page {
  async enterDetails(formDetail) {
    await super.textInputElement(1).setValue(formDetail.name)
    await super.textInputElement(2).setValue(formDetail.email)
    await super.textInputElement(3).setValue(formDetail.telephone)
    await super.textInputElement(4).setValue(formDetail.jobTitle)
  }
}

export default new OrganisationDetailsWhoIsCompletingPage()
