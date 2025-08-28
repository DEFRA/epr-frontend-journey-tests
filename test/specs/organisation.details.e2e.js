import { browser, expect } from '@wdio/globals'
import {
  companiesHouseDetails,
  applicationContactDetails,
  partnerName
} from '../support/form.values.js'

import OrganisationDetailsHomePage from 'page-objects/organisation.details/organisation.details.home.page.js'
import OrganisationDetailsRegisteredCharityPage from 'page-objects/organisation.details/organisation.details.registered.charity.page.js'
import OrganisationDetailsRecyclingExporterPage from 'page-objects/organisation.details/organisation.details.recycling.exporter.page.js'
import OrganisationDetailsWhoIsCompletingPage from 'page-objects/organisation.details/organisation.details.who.is.completing.js'
import OrganisationDetailsUKNationsPage from 'page-objects/organisation.details/organisation.details.uk.nations.js'
import OrganisationDetailsRegisteredCompaniesHousePage from 'page-objects/organisation.details/organisation.details.registered.companies.house.js'
import OrganisationDetailsCompaniesHouseDetailsPage from 'page-objects/organisation.details/organisation.details.companies.house.details.js'
import OrganisationDetailsPartnershipPage from 'page-objects/organisation.details/organisation.details.partnership.page.js'
import OrganisationDetailsLimitedPartnershipPage from 'page-objects/organisation.details/organisation.details.limited.partnership.page.js'
import OrganisationDetailsAddMorePartnersPage from 'page-objects/organisation.details/organisation.details.add.more.partners.page.js'

describe('Organisation details form', () => {
  it('Should not need to complete the form if it is a charity', async () => {
    await OrganisationDetailsHomePage.open()
    await OrganisationDetailsHomePage.continue()

    await OrganisationDetailsRegisteredCharityPage.yes()
    await OrganisationDetailsRegisteredCharityPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining("You don't need to register")
    )
  })

  it('Should not need to complete the form if it is not an Exporter nor a Reprocessor', async () => {
    await OrganisationDetailsHomePage.open()
    await OrganisationDetailsHomePage.continue()

    await OrganisationDetailsRegisteredCharityPage.no()
    await OrganisationDetailsRegisteredCharityPage.continue()

    await OrganisationDetailsRecyclingExporterPage.noneOfAbove()
    await OrganisationDetailsRecyclingExporterPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining('You do not need to register')
    )
  })

  it('Should complete the form if it is an Exporter', async () => {
    await OrganisationDetailsHomePage.open()
    await OrganisationDetailsHomePage.continue()

    await OrganisationDetailsRegisteredCharityPage.no()
    await OrganisationDetailsRegisteredCharityPage.continue()

    await OrganisationDetailsRecyclingExporterPage.exporter()
    await OrganisationDetailsRecyclingExporterPage.continue()

    await OrganisationDetailsWhoIsCompletingPage.enterDetails(
      applicationContactDetails
    )
    await OrganisationDetailsWhoIsCompletingPage.continue()

    await OrganisationDetailsRegisteredCompaniesHousePage.yes()
    await OrganisationDetailsRegisteredCompaniesHousePage.continue()

    await OrganisationDetailsCompaniesHouseDetailsPage.enterDetails(
      companiesHouseDetails
    )
    await OrganisationDetailsCompaniesHouseDetailsPage.continue()

    await OrganisationDetailsPartnershipPage.no()
    await OrganisationDetailsPartnershipPage.continue()

    await expect(browser).toHaveTitle(expect.stringContaining('Summary'))
  })

  it('Should complete the form if it is a Reprocessor', async () => {
    await OrganisationDetailsHomePage.open()
    await OrganisationDetailsHomePage.continue()

    await OrganisationDetailsRegisteredCharityPage.no()
    await OrganisationDetailsRegisteredCharityPage.continue()

    await OrganisationDetailsRecyclingExporterPage.reprocessor()
    await OrganisationDetailsRecyclingExporterPage.continue()

    await OrganisationDetailsWhoIsCompletingPage.enterDetails(
      applicationContactDetails
    )
    await OrganisationDetailsWhoIsCompletingPage.continue()

    await OrganisationDetailsUKNationsPage.england()
    await OrganisationDetailsUKNationsPage.continue()

    await OrganisationDetailsRegisteredCompaniesHousePage.yes()
    await OrganisationDetailsRegisteredCompaniesHousePage.continue()

    await OrganisationDetailsCompaniesHouseDetailsPage.enterDetails(
      companiesHouseDetails
    )
    await OrganisationDetailsCompaniesHouseDetailsPage.continue()

    await OrganisationDetailsPartnershipPage.no()
    await OrganisationDetailsPartnershipPage.continue()

    await expect(browser).toHaveTitle(expect.stringContaining('Summary'))
  })

  it('Should complete the form if it is a Exporter / Reprocessor with a Limited Partnership', async () => {
    await OrganisationDetailsHomePage.open()
    await OrganisationDetailsHomePage.continue()

    await OrganisationDetailsRegisteredCharityPage.no()
    await OrganisationDetailsRegisteredCharityPage.continue()

    await OrganisationDetailsRecyclingExporterPage.reprocessorAndExporter()
    await OrganisationDetailsRecyclingExporterPage.continue()

    await OrganisationDetailsWhoIsCompletingPage.enterDetails(
      applicationContactDetails
    )
    await OrganisationDetailsWhoIsCompletingPage.continue()

    await OrganisationDetailsUKNationsPage.wales()
    await OrganisationDetailsUKNationsPage.continue()

    await OrganisationDetailsRegisteredCompaniesHousePage.yes()
    await OrganisationDetailsRegisteredCompaniesHousePage.continue()

    await OrganisationDetailsCompaniesHouseDetailsPage.enterDetails(
      companiesHouseDetails
    )
    await OrganisationDetailsCompaniesHouseDetailsPage.continue()

    await OrganisationDetailsPartnershipPage.yesLimited()
    await OrganisationDetailsPartnershipPage.continue()

    await OrganisationDetailsLimitedPartnershipPage.enterPartnerName(
      partnerName
    )
    await OrganisationDetailsLimitedPartnershipPage.companyPartner()
    await OrganisationDetailsLimitedPartnershipPage.continue()

    await OrganisationDetailsAddMorePartnersPage.continue()

    await expect(browser).toHaveTitle(expect.stringContaining('Summary'))
  })
})
