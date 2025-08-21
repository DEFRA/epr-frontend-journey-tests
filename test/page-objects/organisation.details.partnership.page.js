import { Page } from 'page-objects/page'

class OrganisationDetailsPartnershipPage extends Page {
  async yesLimited() {
    await $('#hnwFjT').click()
  }

  async yesLimitedLiability() {
    await $('#hnwFjT-2').click()
  }

  async no() {
    await $('#hnwFjT-3').click()
  }
}

export default new OrganisationDetailsPartnershipPage()
