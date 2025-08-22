import { Page } from 'page-objects/page.js'

class OrganisationDetailsRegisteredCompaniesHousePage extends Page {
  async yes() {
    await $('#hNTczg').click()
  }

  async no() {
    await $('#hNTczg-2').click()
  }
}

export default new OrganisationDetailsRegisteredCompaniesHousePage()
