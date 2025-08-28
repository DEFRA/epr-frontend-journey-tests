import { browser, expect } from '@wdio/globals'
import {
  orgId,
  referenceNumber,
  applicationContactDetails,
  signatory,
  SIPFile,
  address,
  percentages
} from '../support/form.values.js'

import AccreditationReprocessorHomePage from 'page-objects/accreditation.reprocessor/accreditation.reprocessor.home.page.js'
import AccreditationReprocessorOrganisationIdPage from 'page-objects/accreditation.reprocessor/accreditation.reprocessor.organisation.id.page.js'
import AccreditationReprocessorOrganisationDetailsPage from 'page-objects/accreditation.reprocessor/accreditation.reprocessor.organisation.details.page.js'
import AccreditationReprocessorSiteDetailsPage from 'page-objects/accreditation.reprocessor/accreditation.reprocessor.site.details.page.js'
import AccreditationReprocessorPackagingWasteCategoryPage from 'page-objects/accreditation.reprocessor/accreditation.reprocessor.packaging.waste.category.page.js'
import AccreditationReprocessorWasteNotesPage from 'page-objects/accreditation.reprocessor/accreditation.reprocessor.packaging.waste.notes.page.js'
import AccreditationReprocessorSignatoryDetailsPage from 'page-objects/accreditation.reprocessor/accreditation.reprocessor.signatory.details.page.js'
import AccreditationReprocessorSignatorySummaryPage from 'page-objects/accreditation.reprocessor/accreditation.reprocessor.signatory.summary.page.js'
import AccreditationReprocessorBusinessPlanPage from 'page-objects/accreditation.reprocessor/accreditation.reprocessor.business.plan.page.js'
import AccreditationReprocessorSamplingAndInspectionPage from 'page-objects/accreditation.reprocessor/accreditation.reprocessor.sampling.and.inspection.page.js'
import AccreditationReprocessorYourContactDetailsPage from 'page-objects/accreditation.reprocessor/accreditation.reprocessor.your.contact.details.js'

describe('Accreditation as Reprocessor form', () => {
  it('Should not be able to apply if there is no Organisation ID', async () => {
    await AccreditationReprocessorHomePage.open()
    await AccreditationReprocessorHomePage.continue()

    await AccreditationReprocessorOrganisationIdPage.no()
    await AccreditationReprocessorOrganisationIdPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining('Apply for an Organisation ID')
    )
  })

  it('Should be able to apply for accreditation', async () => {
    await AccreditationReprocessorHomePage.open()
    await AccreditationReprocessorHomePage.continue()

    await AccreditationReprocessorOrganisationIdPage.yes()
    await AccreditationReprocessorOrganisationIdPage.continue()

    await AccreditationReprocessorOrganisationDetailsPage.enterDetails(
      orgId,
      referenceNumber
    )
    await AccreditationReprocessorOrganisationDetailsPage.continue()

    await AccreditationReprocessorSiteDetailsPage.enterDetails(
      address.line1,
      address.postcode
    )
    await AccreditationReprocessorSiteDetailsPage.continue()

    await AccreditationReprocessorPackagingWasteCategoryPage.aluminium()
    await AccreditationReprocessorPackagingWasteCategoryPage.continue()

    await AccreditationReprocessorWasteNotesPage.fiveHundredTonnes()
    await AccreditationReprocessorWasteNotesPage.continue()

    await AccreditationReprocessorSignatoryDetailsPage.enterDetails(signatory)
    await AccreditationReprocessorSignatoryDetailsPage.continue()

    await AccreditationReprocessorSignatorySummaryPage.continue()

    await AccreditationReprocessorBusinessPlanPage.enterDetails(percentages)
    await AccreditationReprocessorBusinessPlanPage.continue()

    await AccreditationReprocessorSamplingAndInspectionPage.uploadFile(SIPFile)
    await AccreditationReprocessorSamplingAndInspectionPage.waitForContinueButton()
    await AccreditationReprocessorSamplingAndInspectionPage.continue()

    await AccreditationReprocessorYourContactDetailsPage.enterDetails(
      applicationContactDetails
    )
    await AccreditationReprocessorYourContactDetailsPage.continue()

    await expect(browser).toHaveTitle(expect.stringContaining('Summary'))
  })
})
