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
    // GOV.UK radios use idPrefix, so first radio is #organisation-id-1
    await $('#organisation-id-1').click()
    await $('button[type=submit]').click()
  }

  async welcomeText() {
    return await $('#main-content div.govuk-panel__body').getText()
  }

  async navLinkElements() {
    return await $$('ul#navigation li a').getElements()
  }

  async registrationLink() {
    await $('#main-content a').click()
  }

  async signOut() {
    const links = await $$('#navigation a')
    const navLink = await links.find(
      async (link) => (await link.getText()) === 'Sign out'
    )
    navLink.click()
  }
}

export default new HomePage()
