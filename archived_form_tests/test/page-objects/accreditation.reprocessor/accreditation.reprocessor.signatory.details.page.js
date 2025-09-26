import { Page } from '../page.js'

class AccreditationReprocessorSignatoryDetailsPage extends Page {
  async enterDetails(signatory) {
    await $(
      '#main-content > div > div > form > div:nth-child(3) > input'
    ).setValue(signatory.fullName)
    await $(
      '#main-content > div > div > form > div:nth-child(4) > input'
    ).setValue(signatory.email)
    await $(
      '#main-content > div > div > form > div:nth-child(5) > input'
    ).setValue(signatory.telephone)
    await $(
      '#main-content > div > div > form > div:nth-child(6) > input'
    ).setValue(signatory.jobTitle)
  }
}

export default new AccreditationReprocessorSignatoryDetailsPage()
