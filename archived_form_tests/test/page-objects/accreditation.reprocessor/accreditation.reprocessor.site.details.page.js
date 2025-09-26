import { Page } from '../page.js'

class AccreditationReprocessorSiteDetailsPage extends Page {
  async enterDetails(firstLine, postcode) {
    await $(
      '#main-content > div > div > form > div:nth-child(2) > input'
    ).setValue(firstLine)
    await $(
      '#main-content > div > div > form > div:nth-child(3) > input'
    ).setValue(postcode)
  }
}

export default new AccreditationReprocessorSiteDetailsPage()
