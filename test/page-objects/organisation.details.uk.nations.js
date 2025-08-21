import { Page } from 'page-objects/page'

class OrganisationDetailsUKNationsPage extends Page {
  england() {
    $('#VcdRNr').click()
  }

  scotland() {
    $('#VcdRNr-2').click()
  }

  wales() {
    $('#VcdRNr-3').click()
  }

  northernIreland() {
    $('#VcdRNr-4').click()
  }
}

export default new OrganisationDetailsUKNationsPage()
