import { Page } from 'page-objects/page'

class OrganisationDetailsRegisteredCharityPage extends Page {
  yes() {
    $('#FAxvwq').click()
  }

  no() {
    $('#FAxvwq-2').click()
  }
}

export default new OrganisationDetailsRegisteredCharityPage()
