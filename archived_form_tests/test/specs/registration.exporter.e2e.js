import { browser, expect } from '@wdio/globals'
import {
  orgName,
  orgId,
  referenceNumber,
  address,
  regNumber,
  applicationContactDetails,
  approvedPerson,
  SIPFile,
  ORSLogFile,
  wasteFromText,
  UKPort
} from '../support/form.values.js'

import RegistrationExporterHomePage from '~/archived_form_tests/test/page-objects/registration.exporter/registration.exporter.home.page.js'
import RegistrationExporterOrganisationIdPage from '~/archived_form_tests/test/page-objects/registration.exporter/registration.exporter.organisation.id.page.js'
import RegistrationExporterOrganisationDetailsPage from '~/archived_form_tests/test/page-objects/registration.exporter/registration.exporter.organisation.details.page.js'
import RegistrationExporterApplicationContactDetailsPage from '~/archived_form_tests/test/page-objects/registration.exporter/registration.exporter.application.contact.details.page.js'
import RegistrationExporterWhatPermitPage from '~/archived_form_tests/test/page-objects/registration.exporter/registration.exporter.what.permit.page.js'
import RegistrationExporterWasteCarrierNumberPage from '~/archived_form_tests/test/page-objects/registration.exporter/registration.exporter.waste.carrier.number.page.js'
import RegistrationExporterWasteCategoryPage from '~/archived_form_tests/test/page-objects/registration.exporter/registration.exporter.packaging.waste.category.page.js'
import RegistrationExporterWasteFromPage from '~/archived_form_tests/test/page-objects/registration.exporter/registration.exporter.waste.from.page.js'
import RegistrationExporterSamplingAndInspectionPage from '~/archived_form_tests/test/page-objects/registration.exporter/registration.exporter.sampling.and.inspection.page.js'
import RegistrationExporterApprovedPersonPage from '~/archived_form_tests/test/page-objects/registration.exporter/registration.exporter.approved.person.page.js'
import RegistrationExporterYourContactDetailsPage from '~/archived_form_tests/test/page-objects/registration.exporter/registration.exporter.your.contact.details.js'
import RegistrationExporterWhatAddressRegulatorServesToPage from '~/archived_form_tests/test/page-objects/registration.exporter/registration.exporter.what.address.regulator.serves.to.page.js'
import RegistrationExporterOverseasReprocessingSitesPage from '~/archived_form_tests/test/page-objects/registration.exporter/registration.exporter.overseas.reprocessing.sites.page.js'
import RegistrationExporterUKPortsPage from '~/archived_form_tests/test/page-objects/registration.exporter/registration.exporter.uk.ports.page.js'
import RegistrationExporterUKPortsSummaryPage from '~/archived_form_tests/test/page-objects/registration.exporter/registration.exporter.uk.ports.summary.page.js'

describe('Registration as Exporter form', () => {
  it('Should not be able to register if there is no Organisation ID', async () => {
    await RegistrationExporterHomePage.open()
    await RegistrationExporterHomePage.continue()

    await RegistrationExporterOrganisationIdPage.no()
    await RegistrationExporterOrganisationIdPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining('Apply for an Organisation ID')
    )
  })

  it('Should be able to register', async () => {
    await RegistrationExporterHomePage.open()
    await RegistrationExporterHomePage.continue()

    await RegistrationExporterOrganisationIdPage.yes()
    await RegistrationExporterOrganisationIdPage.continue()

    await RegistrationExporterOrganisationDetailsPage.enterDetails(
      orgName,
      orgId,
      referenceNumber
    )
    await RegistrationExporterOrganisationDetailsPage.continue()

    await RegistrationExporterApplicationContactDetailsPage.enterDetails(
      applicationContactDetails
    )
    await RegistrationExporterApplicationContactDetailsPage.continue()

    await RegistrationExporterWhatAddressRegulatorServesToPage.enterAddress(
      address
    )
    await RegistrationExporterWhatAddressRegulatorServesToPage.continue()

    await RegistrationExporterWasteCarrierNumberPage.regNumber(regNumber)
    await RegistrationExporterWasteCarrierNumberPage.continue()

    await RegistrationExporterWhatPermitPage.environmental()
    await RegistrationExporterWhatPermitPage.continue()

    await RegistrationExporterWasteCategoryPage.aluminium()
    await RegistrationExporterWasteCategoryPage.continue()

    await RegistrationExporterWasteFromPage.details(wasteFromText)
    await RegistrationExporterWasteFromPage.continue()

    await RegistrationExporterUKPortsPage.enter(UKPort)
    await RegistrationExporterUKPortsPage.continue()

    await RegistrationExporterUKPortsSummaryPage.continue()

    await RegistrationExporterSamplingAndInspectionPage.uploadFile(SIPFile)
    await RegistrationExporterSamplingAndInspectionPage.waitForContinueButton()
    await RegistrationExporterSamplingAndInspectionPage.continue()

    await RegistrationExporterOverseasReprocessingSitesPage.uploadFile(
      ORSLogFile
    )
    await RegistrationExporterOverseasReprocessingSitesPage.waitForContinueButton()
    await RegistrationExporterOverseasReprocessingSitesPage.continue()

    await RegistrationExporterApprovedPersonPage.details(approvedPerson)
    await RegistrationExporterApprovedPersonPage.director()
    await RegistrationExporterApprovedPersonPage.continue()

    await RegistrationExporterYourContactDetailsPage.enterDetails(
      applicationContactDetails
    )
    await RegistrationExporterYourContactDetailsPage.continue()

    await expect(browser).toHaveTitle(expect.stringContaining('Summary'))
    await $('#main-content > div > div > form > button').click()
    await expect(browser).toHaveTitle(expect.stringContaining('Form submitted'))
  })
})
