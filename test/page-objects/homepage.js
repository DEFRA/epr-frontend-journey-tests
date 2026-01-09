import { browser, $, $$ } from '@wdio/globals'

class HomePage {
  open(lang = '') {
    return browser.url(lang + '/')
  }

  openStart(lang = '') {
    return browser.url(lang + '/start')
  }

  async getStartNowHref() {
    return await $('a.govuk-button').getAttribute('href')
  }

  async clickStartNow() {
    await $('a.govuk-button').click()
  }

  async signInLink() {
    await $('a[role=button]').click()
  }

  async linkRegistration() {
    await $('input[type=radio]').click()
    await $('button[type=submit]').click()
  }

  async navLinkElements() {
    return await $$('.govuk-service-navigation__item a').getElements()
  }

  async signOut() {
    await $('a*=Sign out').click()
  }
}

export default new HomePage()
