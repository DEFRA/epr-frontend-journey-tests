import { Page } from '../page.js'

class OrganisationDetailsCompaniesHouseDetailsPage extends Page {
  async enterDetails(companyDetails) {
    await super.textInputElement(1).setValue(companyDetails.companyName)
    await super.textInputElement(2).setValue(companyDetails.businessTradingName)
    await super.textInputElement(3).setValue(companyDetails.regNo)
    await super
      .fieldsetTextInputElement(1)
      .setValue(companyDetails.address.line1)
    await super
      .fieldsetTextInputElement(2)
      .setValue(companyDetails.address.line2)
    await super
      .fieldsetTextInputElement(3)
      .setValue(companyDetails.address.town)
    await super
      .fieldsetTextInputElement(4)
      .setValue(companyDetails.address.county)
    await super
      .fieldsetTextInputElement(5)
      .setValue(companyDetails.address.postcode)
  }
}

export default new OrganisationDetailsCompaniesHouseDetailsPage()
