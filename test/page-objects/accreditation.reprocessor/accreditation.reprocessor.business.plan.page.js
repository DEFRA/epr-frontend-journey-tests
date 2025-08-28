import { Page } from 'page-objects/page.js'

class AccreditationReprocessorBusinessPlanPage extends Page {
  async enterDetails(percentages) {
    await $(
      '#main-content > div > div > form > div:nth-child(3) > div.govuk-input__wrapper > input'
    ).setValue(percentages.infrastructure)
    await $(
      '#main-content > div > div > form > div:nth-child(4) > textarea'
    ).setValue('Testing')
    await $(
      '#main-content > div > div > form > div:nth-child(5) > div.govuk-input__wrapper > input'
    ).setValue(percentages.priceSupport)
    await $(
      '#main-content > div > div > form > div:nth-child(6) > textarea'
    ).setValue('Testing')
    await $(
      '#main-content > div > div > form > div:nth-child(7) > div.govuk-input__wrapper > input'
    ).setValue(percentages.businessCollections)
    await $(
      '#main-content > div > div > form > div:nth-child(8) > textarea'
    ).setValue('Testing')
    await $(
      '#main-content > div > div > form > div:nth-child(9) > div.govuk-input__wrapper > input'
    ).setValue(percentages.comms)
    await $(
      '#main-content > div > div > form > div:nth-child(10) > textarea'
    ).setValue('Testing')
    await $(
      '#main-content > div > div > form > div:nth-child(11) > div.govuk-input__wrapper > input'
    ).setValue(percentages.newMarkets)
    await $(
      '#main-content > div > div > form > div:nth-child(12) > textarea'
    ).setValue('Testing')
    await $(
      '#main-content > div > div > form > div:nth-child(13) > div.govuk-input__wrapper > input'
    ).setValue(percentages.newUse)
    await $(
      '#main-content > div > div > form > div:nth-child(14) > textarea'
    ).setValue('Testing')
    await $(
      '#main-content > div > div > form > div:nth-child(15) > div.govuk-input__wrapper > input'
    ).setValue(percentages.other)
    await $(
      '#main-content > div > div > form > div:nth-child(16) > textarea'
    ).setValue('Testing')
  }
}

export default new AccreditationReprocessorBusinessPlanPage()
