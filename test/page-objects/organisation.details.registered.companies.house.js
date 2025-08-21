import { Page } from 'page-objects/page'

class OrganisationDetailsRegisteredCompaniesHousePage extends Page {
  yes() {
    $('#hNTczg').click()
  }

  no() {
    $('#hNTczg-2').click()
  }
}

export default new OrganisationDetailsRegisteredCompaniesHousePage()
