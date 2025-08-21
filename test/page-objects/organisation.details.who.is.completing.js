import { Page } from 'page-objects/page'

class OrganisationDetailsWhoIsCompletingPage extends Page {
  details(fullName, email, telephone, jobTitle) {
    $('#BYtjnh').setValue(fullName)
    $('#aSoxDO').setValue(email)
    $('#aIFHXo').setValue(telephone)
    $('#LyeSzH').setValue(jobTitle)
  }
}

export default new OrganisationDetailsWhoIsCompletingPage()
