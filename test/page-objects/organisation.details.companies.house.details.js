import { Page } from 'page-objects/page'

class OrganisationDetailsCompaniesHouseDetailsPage extends Page {
  details(companyName, businessTradingName, regNo, address) {
    $('#RUKDyH').setValue(companyName)
    $('#XcvvZV').setValue(businessTradingName)
    $('#VZLTnn').setValue(regNo)
    $('#GNVlAd__addressLine1').setValue(address.line1)
    $('#GNVlAd__addressLine2').setValue(address.line2)
    $('#GNVlAd__town').setValue(address.town)
    $('#GNVlAd__county').setValue(address.county)
    $('#GNVlAd__postcode').setValue(address.postcode)
  }
}

export default new OrganisationDetailsCompaniesHouseDetailsPage()
