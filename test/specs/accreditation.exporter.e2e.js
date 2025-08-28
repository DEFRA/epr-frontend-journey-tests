import { browser, expect } from '@wdio/globals'
import {
  orgId,
  referenceNumber,
  applicationContactDetails,
  signatory,
  SIPFile,
  ORSLogFile,
  percentages,
  orgName
} from '../support/form.values.js'

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
      orgName,
      orgId,
      referenceNumber
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

    await AccreditationExporterSamplingAndInspectionPage.uploadFile(SIPFile)
    await AccreditationExporterSamplingAndInspectionPage.waitForContinueButton()
    await AccreditationExporterSamplingAndInspectionPage.continue()

    await AccreditationExporterOverseasReprocessingSitesPage.uploadFile(
      ORSLogFile
    )
    await AccreditationExporterOverseasReprocessingSitesPage.waitForContinueButton()
    await AccreditationExporterOverseasReprocessingSitesPage.continue()

    await AccreditationExporterBESPage.continue()

    await AccreditationExporterYourContactDetailsPage.enterDetails(
      applicationContactDetails
    )
    await AccreditationExporterYourContactDetailsPage.continue()

    await expect(browser).toHaveTitle(expect.stringContaining('Summary'))
    await $('#main-content > div > div > form > button').click()
    await expect(browser).toHaveTitle(expect.stringContaining('Form submitted'))
  })
})
