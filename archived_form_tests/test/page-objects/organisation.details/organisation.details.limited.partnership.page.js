import { Page } from '../page.js'

class OrganisationDetailsLimitedPartnershipPage extends Page {
  async enterPartnerName(partnerName) {
    await $(
      '#main-content > div > div > form > div:nth-child(3) > input'
    ).setValue(partnerName)
    // await super.textInputElement(1).setValue(partnerName)
  }

  async companyPartner() {
    await super.radioInputElement(1).click()
  }

  async individualPartner() {
    await super.radioInputElement(2).click()
  }
}

export default new OrganisationDetailsLimitedPartnershipPage()
