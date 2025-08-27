import { Page } from 'page-objects/page.js'
import { $ } from '@wdio/globals'

class RegistrationExporterUKPortsSummaryPage extends Page {
  async continue() {
    const continueButton = $(
      '#main-content > div > div > div.govuk-button-group > form > button:nth-child(2)'
    )
    continueButton.waitForClickable({ timeout: 3000 })
    continueButton.click()
  }
}

export default new RegistrationExporterUKPortsSummaryPage()
