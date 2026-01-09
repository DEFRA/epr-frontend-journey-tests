import { $, $$ } from '@wdio/globals'

class SiteFurniturePage {
  // Service Navigation selectors
  get serviceNameLink() {
    return $('.govuk-service-navigation__service-name a')
  }

  get navigationList() {
    return $('.govuk-service-navigation__list')
  }

  get navigationItems() {
    return $$('.govuk-service-navigation__item')
  }

  get navigationLinks() {
    return $$('.govuk-service-navigation__item a')
  }

  // Phase Banner selectors
  get phaseBannerTag() {
    return $('.govuk-phase-banner__content__tag')
  }

  get phaseBannerFeedbackLink() {
    return $('.govuk-phase-banner__text a')
  }

  /**
   * Get the service name link href
   */
  async getServiceNameHref() {
    return await this.serviceNameLink.getAttribute('href')
  }

  /**
   * Click the service name link
   */
  async clickServiceName() {
    await this.serviceNameLink.click()
  }

  /**
   * Get the phase banner tag text (e.g. "Beta")
   */
  async getPhaseTagText() {
    return await this.phaseBannerTag.getText()
  }

  /**
   * Get the feedback link href
   */
  async getFeedbackLinkHref() {
    return await this.phaseBannerFeedbackLink.getAttribute('href')
  }

  /**
   * Get the feedback link text
   */
  async getFeedbackLinkText() {
    return await this.phaseBannerFeedbackLink.getText()
  }

  /**
   * Check if navigation list is visible
   */
  async isNavigationVisible() {
    return await this.navigationList.isExisting()
  }

  /**
   * Get all navigation link texts
   */
  async getNavigationLinkTexts() {
    const links = await this.navigationLinks.getElements()
    const texts = []
    for (const link of links) {
      texts.push(await link.getText())
    }
    return texts
  }

  /**
   * Get a navigation link by its text
   * @param {string} text - The link text to find
   */
  async getNavigationLinkByText(text) {
    const links = await this.navigationLinks.getElements()
    for (const link of links) {
      if ((await link.getText()) === text) {
        return link
      }
    }
    return null
  }

  /**
   * Click a navigation link by its text
   * @param {string} text - The link text to click
   */
  async clickNavigationLink(text) {
    const link = await this.getNavigationLinkByText(text)
    if (!link) {
      throw new Error(`Navigation link with text "${text}" not found`)
    }
    await link.click()
  }

  /**
   * Get the href of a navigation link by its text
   * @param {string} text - The link text
   */
  async getNavigationLinkHref(text) {
    const link = await this.getNavigationLinkByText(text)
    if (!link) {
      return null
    }
    return await link.getAttribute('href')
  }
}

export default new SiteFurniturePage()
