import { Page } from 'page-objects/page'

class OrganisationDetailsWhoIsCompletingPage extends Page {
  async details(fullName, email, telephone, jobTitle) {
    await $('#BYtjnh').setValue(fullName)
    await $('#aSoxDO').setValue(email)
    await $('#aIFHXo').setValue(telephone)
    await $('#LyeSzH').setValue(jobTitle)
  }
}

export default new OrganisationDetailsWhoIsCompletingPage()
