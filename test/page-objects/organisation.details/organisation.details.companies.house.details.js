import { Page } from 'page-objects/page.js'

class OrganisationDetailsCompaniesHouseDetailsPage extends Page {
  async enterDetails(companyDetails) {
    await $('#RUKDyH').setValue(companyDetails.companyName)
    await $('#XcvvZV').setValue(companyDetails.businessTradingName)
    await $('#VZLTnn').setValue(companyDetails.regNo)
    await $('#GNVlAd__addressLine1').setValue(companyDetails.address.line1)
    await $('#GNVlAd__addressLine2').setValue(companyDetails.address.line2)
    await $('#GNVlAd__town').setValue(companyDetails.address.town)
    await $('#GNVlAd__county').setValue(companyDetails.address.county)
    await $('#GNVlAd__postcode').setValue(companyDetails.address.postcode)
  }
}

export default new OrganisationDetailsCompaniesHouseDetailsPage()
