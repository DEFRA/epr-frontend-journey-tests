import { Page } from '../page.js'
import { $ } from '@wdio/globals'

class OrganisationDetailsAddMorePartnersPage extends Page {
  async changePartner(index) {
    $(
      `#main-content dd.govuk-summary-list__actions > a:nth-child(${index})`
    ).click()
  }

  async addAnotherPartner() {
    await $('#main-content button.govuk-button.govuk-button--secondary').click()
  }

  async continue() {
    const continueButton = $(
      '#main-content > div > div > div.govuk-button-group > form > button:nth-child(2)'
    )
    continueButton.waitForClickable({ timeout: 3000 })
    continueButton.click()
  }
}

export default new OrganisationDetailsAddMorePartnersPage()
