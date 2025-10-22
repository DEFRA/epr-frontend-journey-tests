import { browser, $ } from '@wdio/globals'

class EprFrontendHomePage {
  open(lang = '') {
    return browser.url(lang + '/')
  }

  registrationLink() {
    $('#main-content a').click()
  }
}

export default new EprFrontendHomePage()
