import { browser, expect } from '@wdio/globals'
import {
  orgId,
  referenceNumber,
  address,
  regNumber,
  applicationContactDetails,
  approvedPerson,
  tonnage,
  SIPFile,
  wasteFromText,
  permitNumber,
  gridRef,
  rawMaterial,
  products,
  equipment,
  orgName
} from '../support/form.values.js'

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
import RegistrationReprocessorWasteDetailsPage from 'page-objects/registration.reprocessor/registration.reprocessor.waste.details.page.js'

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
      orgName,
      orgId,
      referenceNumber
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
      gridRef
    )
    await RegistrationReprocessorReprocessingSiteDetailsPage.yes()
    await RegistrationReprocessorReprocessingSiteDetailsPage.continue()

    await RegistrationReprocessorSitePermitPage.aluminium()
    await RegistrationReprocessorSitePermitPage.continue()

    await RegistrationReprocessorWhatPermitPage.environmental()
    await RegistrationReprocessorWhatPermitPage.continue()

    await RegistrationReprocessorLicenceDetailsPage.permit(permitNumber)
    await RegistrationReprocessorLicenceDetailsPage.aluminium()
    await RegistrationReprocessorLicenceDetailsPage.continue()

    await RegistrationReprocessorWasteDetailsPage.tonnage(tonnage)
    await RegistrationReprocessorWasteDetailsPage.monthly()
    await RegistrationReprocessorWasteDetailsPage.continue()

    await RegistrationReprocessorSiteCapacityPage.tonnage(tonnage)
    await RegistrationReprocessorSiteCapacityPage.monthly()
    await RegistrationReprocessorSiteCapacityPage.continue()

    await RegistrationReprocessorWasteCarrierNumberPage.regNumber(regNumber)
    await RegistrationReprocessorWasteCarrierNumberPage.continue()

    await RegistrationReprocessorWasteCategoryPage.aluminium()
    await RegistrationReprocessorWasteCategoryPage.continue()

    await RegistrationReprocessorWasteFromPage.details(wasteFromText)
    await RegistrationReprocessorWasteFromPage.continue()

    await RegistrationReprocessorInputsCalendar2024Page.estimatedFigures()
    await RegistrationReprocessorInputsCalendar2024Page.enterTonnages(
      tonnage,
      tonnage,
      tonnage
    )
    await RegistrationReprocessorInputsCalendar2024Page.continue()

    await RegistrationReprocessorRawInputs2024Page.enterDetails(
      rawMaterial,
      tonnage
    )
    await RegistrationReprocessorRawInputs2024Page.continue()

    await RegistrationReprocessorRawInputsSummary2024Page.continue()

    await RegistrationReprocessorOutputsCalendar2024Page.estimatedFigures()
    await RegistrationReprocessorOutputsCalendar2024Page.enterTonnages(
      tonnage,
      tonnage,
      tonnage
    )
    await RegistrationReprocessorOutputsCalendar2024Page.continue()

    await RegistrationReprocessorProductsMadeFromRecycling2024Page.enterTonnages(
      products,
      tonnage
    )
    await RegistrationReprocessorProductsMadeFromRecycling2024Page.continue()

    await RegistrationReprocessorProductsRecycling2024SummaryPage.continue()

    await RegistrationReprocessorKeyPlantAndEquipmentPage.details(equipment)
    await RegistrationReprocessorKeyPlantAndEquipmentPage.continue()

    await RegistrationReprocessorSamplingAndInspectionPage.uploadFile(SIPFile)
    await RegistrationReprocessorSamplingAndInspectionPage.waitForContinueButton()
    await RegistrationReprocessorSamplingAndInspectionPage.continue()

    await RegistrationReprocessorApprovedPersonPage.details(approvedPerson)
    await RegistrationReprocessorApprovedPersonPage.director()
    await RegistrationReprocessorApprovedPersonPage.continue()

    await RegistrationReprocessorYourContactDetailsPage.enterDetails(
      applicationContactDetails
    )
    await RegistrationReprocessorYourContactDetailsPage.continue()

    await expect(browser).toHaveTitle(expect.stringContaining('Summary'))
    await $('#main-content > div > div > form > button').click()
    await expect(browser).toHaveTitle(expect.stringContaining('Form submitted'))
  })
})
