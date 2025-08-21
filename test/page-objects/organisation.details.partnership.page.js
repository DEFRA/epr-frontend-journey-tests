import { Page } from 'page-objects/page'

class OrganisationDetailsPartnershipPage extends Page {
  yesLimited() {
    $('#hnwFjT').click()
  }

  yesLimitedLiability() {
    $('#hnwFjT-2').click()
  }

  no() {
    $('#hnwFjT-3').click()
  }
}

export default new OrganisationDetailsPartnershipPage()
