import { browser } from '@wdio/globals'

class EprFrontendHomePage {
  open() {
    return browser.url('/')
  }
}

export default new EprFrontendHomePage()
