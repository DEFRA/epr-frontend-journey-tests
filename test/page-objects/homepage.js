import { browser, $ } from '@wdio/globals'

class EprFrontendHomePage {
  open() {
    return browser.url('/')
  }

  registrationLink() {
    $('#main-content a').click()
  }
}

export default new EprFrontendHomePage()
