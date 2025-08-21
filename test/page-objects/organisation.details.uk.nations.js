import { Page } from 'page-objects/page'

class OrganisationDetailsUKNationsPage extends Page {
  async england() {
    await $('#VcdRNr').click()
  }

  async scotland() {
    await $('#VcdRNr-2').click()
  }

  async wales() {
    await $('#VcdRNr-3').click()
  }

  async northernIreland() {
    await $('#VcdRNr-4').click()
  }
}

export default new OrganisationDetailsUKNationsPage()
