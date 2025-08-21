import { browser, $ } from '@wdio/globals'

class Page {
  get pageHeading() {
    return $('h1')
  }

  open(path) {
    return browser.url(path)
  }

  continue() {
    const continueButton = $('#main-content div.govuk-button-group > button')
    continueButton.waitForClickable({ timeout: 3000 })
    continueButton.click()
  }
}

export { Page }
