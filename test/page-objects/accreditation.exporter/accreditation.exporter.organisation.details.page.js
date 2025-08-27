import { Page } from 'page-objects/page.js'

class AccreditationExporterOrganisationDetailsPage extends Page {
  async enterDetails(orgId, referenceNumber) {
    await super.textInputElement(1).setValue(orgId)
    await super.textInputElement(2).setValue(referenceNumber)
  }
}

export default new AccreditationExporterOrganisationDetailsPage()
