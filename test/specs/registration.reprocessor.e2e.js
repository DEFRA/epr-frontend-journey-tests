import { browser, expect } from '@wdio/globals'

import RegistrationReprocessorHomePage from 'page-objects/registration.reprocessor/registration.reprocessor.home.page.js'
import RegistrationReprocessorOrganisationIdPage from 'page-objects/registration.reprocessor/registration.reprocessor.organisation.id.page.js'
import RegistrationReprocessorOrganisationDetailsPage from 'page-objects/registration.reprocessor/registration.reprocessor.organisation.details.page.js'
import RegistrationReprocessorApplicationContactDetailsPage from 'page-objects/registration.reprocessor/registration.reprocessor.application.contact.details.page.js'
import RegistrationReprocessorReprocessingSiteDetailsPage from 'page-objects/registration.reprocessor/registration.reprocessor.reprocessing.site.details.page.js'
import RegistrationReprocessorSitePermitPage from 'page-objects/registration.reprocessor/registration.reprocessor.site.permit.page.js'
import RegistrationReprocessorWhatPermitPage from 'page-objects/registration.reprocessor/registration.reprocessor.what.permit.page.js'
import RegistrationReprocessorLicenceDetailsPage from 'page-objects/registration.reprocessor/registration.reprocessor.licence.details.page.js'
import RegistrationReprocessorSiteCapacityPage from 'page-objects/registration.reprocessor/registration.reprocessor.site.capacity.page.js'
import RegistrationReprocessorWasteCarrierNumberPage from 'page-objects/registration.reprocessor/registration.reprocessor.waste.carrier.number.page.js'
import RegistrationReprocessorWasteCategoryPage from 'page-objects/registration.reprocessor/registration.reprocessor.packaging.waste.category.page.js'
import RegistrationReprocessorWasteFromPage from 'page-objects/registration.reprocessor/registration.reprocessor.waste.from.page.js'
import RegistrationReprocessorInputsCalendar2024Page from 'page-objects/registration.reprocessor/registration.reprocessor.inputs.calendar.2024.page.js'
import RegistrationReprocessorRawInputs2024Page from 'page-objects/registration.reprocessor/registration.reprocessor.raw.inputs.2024.page.js'
import RegistrationReprocessorRawInputsSummary2024Page from 'page-objects/registration.reprocessor/registration.reprocessor.raw.inputs.summary.2024.page.js'
import RegistrationReprocessorOutputsCalendar2024Page from 'page-objects/registration.reprocessor/registration.reprocessor.outputs.calendar.2024.page.js'
import RegistrationReprocessorProductsMadeFromRecycling2024Page from 'page-objects/registration.reprocessor/registration.reprocessor.products.made.from.recycling.2024.page.js'
import RegistrationReprocessorProductsRecycling2024SummaryPage from 'page-objects/registration.reprocessor/registration.reprocessor.products.recycling.2024.summary.page.js'
import RegistrationReprocessorKeyPlantAndEquipmentPage from 'page-objects/registration.reprocessor/registration.reprocessor.key.plant.and.equipment.page.js'
import RegistrationReprocessorSamplingAndInspectionPage from 'page-objects/registration.reprocessor/registration.reprocessor.sampling.and.inspection.page.js'
import RegistrationReprocessorApprovedPersonPage from 'page-objects/registration.reprocessor/registration.reprocessor.approved.person.page.js'
import RegistrationReprocessorYourContactDetailsPage from 'page-objects/registration.reprocessor/registration.reprocessor.your.contact.details.js'

const applicationContactDetails = {
  fullName: 'Joe Bloggs',
  email: 'joebloggs@test.com',
  telephone: '07777 123456',
  jobTitle: 'Exporter'
}

const address = {
  line1: 'Rubbish Removals Limited',
  line2: '',
  town: 'Earls Court',
  county: 'London',
  postcode: 'SW5 9PN'
}

const approvedPerson = {
  name: 'Joe Bloggs',
  email: 'approval@approval.com',
  telephone: '07777 689789'
}

describe('Registration as Reprocessor form', () => {
  it('Should not be able to register if there is no Organisation ID', async () => {
    await RegistrationReprocessorHomePage.open()
    await RegistrationReprocessorHomePage.continue()

    await RegistrationReprocessorOrganisationIdPage.no()
    await RegistrationReprocessorOrganisationIdPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining('Apply for an Organisation ID')
    )
  })

  it('Should be able to register', async () => {
    await RegistrationReprocessorHomePage.open()
    await RegistrationReprocessorHomePage.continue()

    await RegistrationReprocessorOrganisationIdPage.yes()
    await RegistrationReprocessorOrganisationIdPage.continue()

    await RegistrationReprocessorOrganisationDetailsPage.enterDetails(
      '123456',
      '123ab456789cd01e23fabc45'
    )
    await RegistrationReprocessorOrganisationDetailsPage.continue()

    await RegistrationReprocessorApplicationContactDetailsPage.enterDetails(
      applicationContactDetails
    )
    await RegistrationReprocessorApplicationContactDetailsPage.continue()

    await RegistrationReprocessorReprocessingSiteDetailsPage.enterAddress(
      address
    )
    await RegistrationReprocessorReprocessingSiteDetailsPage.enterGridReference(
      'AA123456'
    )
    await RegistrationReprocessorReprocessingSiteDetailsPage.yes()
    await RegistrationReprocessorReprocessingSiteDetailsPage.continue()

    await RegistrationReprocessorSitePermitPage.aluminium()
    await RegistrationReprocessorSitePermitPage.continue()

    await RegistrationReprocessorWhatPermitPage.environmental()
    await RegistrationReprocessorWhatPermitPage.continue()

    await RegistrationReprocessorLicenceDetailsPage.permit('123456')
    await RegistrationReprocessorLicenceDetailsPage.tonnage('10')
    await RegistrationReprocessorLicenceDetailsPage.monthly()
    await RegistrationReprocessorLicenceDetailsPage.continue()

    await RegistrationReprocessorSiteCapacityPage.tonnage('15')
    await RegistrationReprocessorSiteCapacityPage.monthly()
    await RegistrationReprocessorSiteCapacityPage.continue()

    await RegistrationReprocessorWasteCarrierNumberPage.regNumber('CBDU123456')
    await RegistrationReprocessorWasteCarrierNumberPage.continue()

    await RegistrationReprocessorWasteCategoryPage.aluminium()
    await RegistrationReprocessorWasteCategoryPage.continue()

    await RegistrationReprocessorWasteFromPage.details(
      'Local council collections'
    )
    await RegistrationReprocessorWasteFromPage.continue()

    await RegistrationReprocessorInputsCalendar2024Page.estimatedFigures()
    await RegistrationReprocessorInputsCalendar2024Page.enterTonnages(
      '10',
      '10',
      '10'
    )
    await RegistrationReprocessorInputsCalendar2024Page.continue()

    await RegistrationReprocessorRawInputs2024Page.enterDetails('Water', '10')
    await RegistrationReprocessorRawInputs2024Page.continue()

    await RegistrationReprocessorRawInputsSummary2024Page.continue()

    await RegistrationReprocessorOutputsCalendar2024Page.estimatedFigures()
    await RegistrationReprocessorOutputsCalendar2024Page.enterTonnages(
      '10',
      '10',
      '10'
    )
    await RegistrationReprocessorOutputsCalendar2024Page.continue()

    await RegistrationReprocessorProductsMadeFromRecycling2024Page.enterTonnages(
      'Milk bottles',
      '10'
    )
    await RegistrationReprocessorProductsMadeFromRecycling2024Page.continue()

    await RegistrationReprocessorProductsRecycling2024SummaryPage.continue()

    await RegistrationReprocessorKeyPlantAndEquipmentPage.details('Equipment')
    await RegistrationReprocessorKeyPlantAndEquipmentPage.continue()

    await RegistrationReprocessorSamplingAndInspectionPage.uploadFile() // TODO: Fix this
    await RegistrationReprocessorSamplingAndInspectionPage.continue()

    await RegistrationReprocessorApprovedPersonPage.details(approvedPerson)
    await RegistrationReprocessorApprovedPersonPage.director()
    await RegistrationReprocessorApprovedPersonPage.continue()

    await RegistrationReprocessorYourContactDetailsPage.enterDetails(
      applicationContactDetails
    )
    await RegistrationReprocessorYourContactDetailsPage.continue()
  })
})
