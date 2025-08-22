import { Page } from 'page-objects/page.js'

class OrganisationDetailsLimitedPartnershipPage extends Page {
  async enterPartnerName(partnerName) {
    await $('#RXPSft').setValue(partnerName)
  }

  async companyPartner() {
    await $('#PEWtSm').click()
  }

  async individualPartner() {
    await $('#PEWtSm-2').click()
  }
}

export default new OrganisationDetailsLimitedPartnershipPage()
