import { browser, expect } from '@wdio/globals'

import AccreditationExporterHomePage from 'page-objects/accreditation.exporter/accreditation.exporter.home.page.js'
import AccreditationExporterOrganisationIdPage from 'page-objects/accreditation.exporter/accreditation.exporter.organisation.id.page.js'
import AccreditationExporterOrganisationDetailsPage from 'page-objects/accreditation.exporter/accreditation.exporter.organisation.details.page.js'
import AccreditationExporterPackagingWasteCategoryPage from 'page-objects/accreditation.exporter/accreditation.exporter.packaging.waste.category.page.js'
import AccreditationExporterWasteNotesPage from 'page-objects/accreditation.exporter/accreditation.exporter.packaging.waste.notes.page.js'
import AccreditationExporterSignatoryDetailsPage from 'page-objects/accreditation.exporter/accreditation.exporter.signatory.details.page.js'
import AccreditationExporterSignatorySummaryPage from 'page-objects/accreditation.exporter/accreditation.exporter.signatory.summary.page.js'
import AccreditationExporterBusinessPlanPage from 'page-objects/accreditation.exporter/accreditation.exporter.business.plan.page.js'
import AccreditationExporterSamplingAndInspectionPage from 'page-objects/accreditation.exporter/accreditation.exporter.sampling.and.inspection.page.js'
import AccreditationExporterYourContactDetailsPage from 'page-objects/accreditation.exporter/accreditation.exporter.your.contact.details.js'
import AccreditationExporterOverseasReprocessingSitesPage from 'page-objects/accreditation.exporter/accreditation.exporter.overseas.reprocessing.sites.page.js'
import AccreditationExporterBESPage from 'page-objects/accreditation.exporter/accreditation.exporter.bes.page.js'

const signatory = {
  fullName: 'Joe Bloggs',
  email: 'joebloggs@test.com',
  telephone: '07777 123456',
  jobTitle: 'Reprocessor'
}

const percentages = {
  infrastructure: '4',
  priceSupport: '10',
  businessCollections: '15',
  comms: '5',
  newMarkets: '20',
  newUse: '10',
  other: '5'
}

const applicationContactDetails = {
  name: 'Joe Bloggs',
  email: 'approval@approval.com',
  telephone: '07777 689789',
  jobTitle: 'Reprocessor'
}

describe('Accreditation as Reprocessor form', () => {
  it('Should not be able to apply if there is no Organisation ID', async () => {
    await AccreditationExporterHomePage.open()
    await AccreditationExporterHomePage.continue()

    await AccreditationExporterOrganisationIdPage.no()
    await AccreditationExporterOrganisationIdPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining('Apply for an Organisation ID')
    )
  })

  it('Should be able to apply for accreditation', async () => {
    await AccreditationExporterHomePage.open()
    await AccreditationExporterHomePage.continue()

    await AccreditationExporterOrganisationIdPage.yes()
    await AccreditationExporterOrganisationIdPage.continue()

    await AccreditationExporterOrganisationDetailsPage.enterDetails(
      '123456',
      '123ab456789cd01e23fabc45'
    )
    await AccreditationExporterOrganisationDetailsPage.continue()

    await AccreditationExporterPackagingWasteCategoryPage.aluminium()
    await AccreditationExporterPackagingWasteCategoryPage.continue()

    await AccreditationExporterWasteNotesPage.fiveHundredTonnes()
    await AccreditationExporterWasteNotesPage.continue()

    await AccreditationExporterSignatoryDetailsPage.enterDetails(signatory)
    await AccreditationExporterSignatoryDetailsPage.continue()

    await AccreditationExporterSignatorySummaryPage.continue()

    await AccreditationExporterBusinessPlanPage.enterDetails(percentages)
    await AccreditationExporterBusinessPlanPage.continue()

    await AccreditationExporterSamplingAndInspectionPage.uploadFile(
      'Reprocessor_Registration_SIP.doc'
    )
    await AccreditationExporterSamplingAndInspectionPage.waitForContinueButton()
    await AccreditationExporterSamplingAndInspectionPage.continue()

    await AccreditationExporterOverseasReprocessingSitesPage.uploadFile(
      'ors_log.xlsx'
    )
    await AccreditationExporterOverseasReprocessingSitesPage.waitForContinueButton()
    await AccreditationExporterOverseasReprocessingSitesPage.continue()

    await AccreditationExporterBESPage.continue()

    await AccreditationExporterYourContactDetailsPage.enterDetails(
      applicationContactDetails
    )
    await AccreditationExporterYourContactDetailsPage.continue()
  })
})
