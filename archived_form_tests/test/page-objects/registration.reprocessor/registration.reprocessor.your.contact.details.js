import { Page } from '../page.js'

class RegistrationReprocessorYourContactDetailsPage extends Page {
  async enterDetails(formDetail) {
    await $(
      '#main-content > div > div > form > div:nth-child(2) > input'
    ).setValue(formDetail.name)
    await $(
      '#main-content > div > div > form > div:nth-child(3) > input'
    ).setValue(formDetail.email)
    await $(
      '#main-content > div > div > form > div:nth-child(4) > input'
    ).setValue(formDetail.telephone)
    await $(
      '#main-content > div > div > form > div:nth-child(5) > input'
    ).setValue(formDetail.jobTitle)
  }
}

export default new RegistrationReprocessorYourContactDetailsPage()
