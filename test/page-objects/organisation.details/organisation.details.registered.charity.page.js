import { Page } from 'page-objects/page.js'

class OrganisationDetailsRegisteredCharityPage extends Page {
  async yes() {
    await $('#FAxvwq').click()
  }

  async no() {
    await $('#FAxvwq-2').click()
  }
}

export default new OrganisationDetailsRegisteredCharityPage()
