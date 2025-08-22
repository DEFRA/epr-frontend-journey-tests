import { Page } from 'page-objects/page.js'

class OrganisationDetailsUKNationsPage extends Page {
  async england() {
    await super.checkboxInputElement(1).click()
  }

  async scotland() {
    await super.checkboxInputElement(2).click()
  }

  async wales() {
    await super.checkboxInputElement(3).click()
  }

  async northernIreland() {
    await super.checkboxInputElement(4).click()
  }
}

export default new OrganisationDetailsUKNationsPage()
