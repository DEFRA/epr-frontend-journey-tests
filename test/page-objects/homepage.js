import { browser, $ } from '@wdio/globals'

class EprFrontendHomePage {
  open(lang = '') {
    return browser.url(lang + '/')
  }

  async signInLink() {
    await $('=Start now').click()
  }

  async registrationLink() {
    await $('#main-content a').click()
  }
}

export default new EprFrontendHomePage()
