import { Page } from '../page.js'

class OrganisationDetailsPartnershipPage extends Page {
  async yesLimited() {
    await super.radioInputElement(1).click()
  }

  async yesLimitedLiability() {
    await super.radioInputElement(2).click()
  }

  async no() {
    await super.radioInputElement(3).click()
  }
}

export default new OrganisationDetailsPartnershipPage()
