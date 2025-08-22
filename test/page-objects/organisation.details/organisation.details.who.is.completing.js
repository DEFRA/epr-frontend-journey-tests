import { Page } from 'page-objects/page.js'

class OrganisationDetailsWhoIsCompletingPage extends Page {
  async enterDetails(formDetail) {
    await $('#BYtjnh').setValue(formDetail.fullName)
    await $('#aSoxDO').setValue(formDetail.email)
    await $('#aIFHXo').setValue(formDetail.telephone)
    await $('#LyeSzH').setValue(formDetail.jobTitle)
  }
}

export default new OrganisationDetailsWhoIsCompletingPage()
