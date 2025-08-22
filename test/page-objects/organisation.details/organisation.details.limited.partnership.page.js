import { Page } from 'page-objects/page.js'

class OrganisationDetailsLimitedPartnershipPage extends Page {
  async enterPartnerName(partnerName) {
    await super.textInputElement(1).setValue(partnerName)
  }

  async companyPartner() {
    await super.radioInputElement(1).click()
  }

  async individualPartner() {
    await super.radioInputElement(2).click()
  }
}

export default new OrganisationDetailsLimitedPartnershipPage()
