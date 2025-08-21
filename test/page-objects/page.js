import { browser, $ } from '@wdio/globals'

class Page {
  get pageHeading() {
    return $('h1')
  }

  open(path) {
    return browser.url(path)
  }

  continue() {
    $('#main-content div.govuk-button-group > button').click()
  }
}

export { Page }
