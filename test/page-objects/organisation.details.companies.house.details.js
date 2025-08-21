import { Page } from 'page-objects/page'

class OrganisationDetailsCompaniesHouseDetailsPage extends Page {
  async details(companyName, businessTradingName, regNo, address) {
    await $('#RUKDyH').setValue(companyName)
    await $('#XcvvZV').setValue(businessTradingName)
    await $('#VZLTnn').setValue(regNo)
    await $('#GNVlAd__addressLine1').setValue(address.line1)
    await $('#GNVlAd__addressLine2').setValue(address.line2)
    await $('#GNVlAd__town').setValue(address.town)
    await $('#GNVlAd__county').setValue(address.county)
    await $('#GNVlAd__postcode').setValue(address.postcode)
  }
}

export default new OrganisationDetailsCompaniesHouseDetailsPage()
