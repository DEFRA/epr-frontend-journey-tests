import { browser, expect } from '@wdio/globals'

import OrganisationDetailsHomePage from 'page-objects/organisation.details.home.page.js'
import OrganisationDetailsRegisteredCharityPage from 'page-objects/organisation.details.registered.charity.page.js'
import OrganisationDetailsRecyclingExporterPage from 'page-objects/organisation.details.recycling.exporter.page.js'
import OrganisationDetailsWhoIsCompletingPage from 'page-objects/organisation.details.who.is.completing.js'
import OrganisationDetailsUKNationsPage from 'page-objects/organisation.details.uk.nations.js'
import OrganisationDetailsRegisteredCompaniesHousePage from 'page-objects/organisation.details.registered.companies.house.js'
import OrganisationDetailsCompaniesHouseDetailsPage from 'page-objects/organisation.details.companies.house.details.js'
import OrganisationDetailsPartnershipPage from 'page-objects/organisation.details.partnership.page.js'

describe('Organisation details form', () => {
  it('Should not need to complete the form if it is a charity', async () => {
    await OrganisationDetailsHomePage.open()
    await expect(browser).toHaveTitle(expect.stringContaining('Form guidance'))
    await OrganisationDetailsHomePage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining('Is your organisation a registered charity?')
    )
    await OrganisationDetailsRegisteredCharityPage.yes()
    await OrganisationDetailsRegisteredCharityPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining("You don't need to register")
    )
  })

  it('Should not need to complete the form if it is not an Exporter nor a Reprocessor', async () => {
    await OrganisationDetailsHomePage.open()
    await expect(browser).toHaveTitle(expect.stringContaining('Form guidance'))
    await OrganisationDetailsHomePage.continue()
    await expect(browser).toHaveTitle(
      expect.stringContaining('Is your organisation a registered charity?')
    )
    await OrganisationDetailsRegisteredCharityPage.no()
    await OrganisationDetailsRegisteredCharityPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining(
        'Are you currently recycling or exporting packaging waste to be recycled?'
      )
    )
    await OrganisationDetailsRecyclingExporterPage.noneOfAbove()
    await OrganisationDetailsRecyclingExporterPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining('You do not need to register')
    )
  })

  it('Should complete the form if it is an Exporter', async () => {
    await OrganisationDetailsHomePage.open()
    await expect(browser).toHaveTitle(expect.stringContaining('Form guidance'))
    await OrganisationDetailsHomePage.continue()
    await expect(browser).toHaveTitle(
      expect.stringContaining('Is your organisation a registered charity?')
    )
    await OrganisationDetailsRegisteredCharityPage.no()
    await OrganisationDetailsRegisteredCharityPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining(
        'Are you currently recycling or exporting packaging waste to be recycled?'
      )
    )
    await OrganisationDetailsRecyclingExporterPage.exporter()
    await OrganisationDetailsRecyclingExporterPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining('Details of who is completing the form')
    )
    await OrganisationDetailsWhoIsCompletingPage.details(
      'Joe Bloggs',
      'joebloggs@test.com',
      '07777 123456',
      'Exporter'
    )

    await OrganisationDetailsWhoIsCompletingPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining(
        'Is your business registered with Companies House?'
      )
    )
    await OrganisationDetailsRegisteredCompaniesHousePage.yes()
    await OrganisationDetailsRegisteredCompaniesHousePage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining('Companies House details')
    )
    await OrganisationDetailsCompaniesHouseDetailsPage.details(
      'Rubbish Removals Limited',
      '',
      'AA123456',
      {
        line1: 'Rubbish Removals Limited',
        line2: '',
        town: 'Earls Court',
        county: 'London',
        postcode: 'SW5 9PN'
      }
    )
    await OrganisationDetailsCompaniesHouseDetailsPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining('Is your organisation a partnership?')
    )
    await OrganisationDetailsPartnershipPage.no()
    await OrganisationDetailsPartnershipPage.continue()

    await expect(browser).toHaveTitle(expect.stringContaining('Summary'))
  })

  it('Should complete the form if it is a Reprocessor', async () => {
    await OrganisationDetailsHomePage.open()
    await expect(browser).toHaveTitle(expect.stringContaining('Form guidance'))
    await OrganisationDetailsHomePage.continue()
    await expect(browser).toHaveTitle(
      expect.stringContaining('Is your organisation a registered charity?')
    )
    await OrganisationDetailsRegisteredCharityPage.no()
    await OrganisationDetailsRegisteredCharityPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining(
        'Are you currently recycling or exporting packaging waste to be recycled?'
      )
    )
    await OrganisationDetailsRecyclingExporterPage.reprocessor()
    await OrganisationDetailsRecyclingExporterPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining('Details of who is completing the form')
    )
    await OrganisationDetailsWhoIsCompletingPage.details(
      'Joe Bloggs',
      'joebloggs@test.com',
      '07777 123456',
      'Reprocessor'
    )

    await OrganisationDetailsWhoIsCompletingPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining(
        'Which UK nations do you have a reprocessing site based in?'
      )
    )
    await OrganisationDetailsUKNationsPage.england()
    await OrganisationDetailsUKNationsPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining(
        'Is your business registered with Companies House?'
      )
    )
    await OrganisationDetailsRegisteredCompaniesHousePage.yes()
    await OrganisationDetailsRegisteredCompaniesHousePage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining('Companies House details')
    )
    await OrganisationDetailsCompaniesHouseDetailsPage.details(
      'Rubbish Removals Limited',
      '',
      'AA123456',
      {
        line1: 'Rubbish Removals Limited',
        line2: '',
        town: 'Earls Court',
        county: 'London',
        postcode: 'SW5 9PN'
      }
    )
    await OrganisationDetailsCompaniesHouseDetailsPage.continue()

    await expect(browser).toHaveTitle(
      expect.stringContaining('Is your organisation a partnership?')
    )
    await OrganisationDetailsPartnershipPage.no()
    await OrganisationDetailsPartnershipPage.continue()

    await expect(browser).toHaveTitle(expect.stringContaining('Summary'))
  })
})
