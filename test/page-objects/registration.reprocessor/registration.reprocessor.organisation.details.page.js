import { Page } from 'page-objects/page.js'

class RegistrationReprocessorOrganisationDetailsPage extends Page {
  async enterDetails(orgName, orgId, referenceNumber) {
    await $(
      '#main-content > div > div > form > div:nth-child(2) > input'
    ).setValue(orgName)
    await $(
      '#main-content > div > div > form > div:nth-child(3) > input'
    ).setValue(orgId)
    await $(
      '#main-content > div > div > form > div:nth-child(4) > input'
    ).setValue(referenceNumber)
  }
}

export default new RegistrationReprocessorOrganisationDetailsPage()
