import { browser, $, $$ } from '@wdio/globals'

class HomePage {
  open(lang = '') {
    return browser.url(lang + '/')
  }

  async signInLink() {
    await $('a[role=button]').click()
  }

  async welcomeText() {
    return await $('#main-content div.govuk-panel__body').getText()
  }

  async navLinkElements() {
    return await $$('div.govuk-service-navigation__container a').getElements()
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
