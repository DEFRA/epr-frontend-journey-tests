import { browser, expect } from '@wdio/globals'

import RegistrationReprocessorHomePage from 'page-objects/registration.reprocessor/registration.reprocessor.home.page.js'
import RegistrationReprocessorOrganisationIdPage from 'page-objects/registration.reprocessor/registration.reprocessor.organisation.id.page.js'
import RegistrationReprocessorOrganisationDetailsPage from 'page-objects/registration.reprocessor/registration.reprocessor.organisation.details.page.js'
import RegistrationReprocessorApplicationContactDetailsPage from 'page-objects/registration.reprocessor/registration.reprocessor.application.contact.details.page.js'
import RegistrationReprocessorWhatAddressRegulatorServesToPage from 'page-objects/registration.reprocessor/registration.reprocessor.what.address.regulator.serves.to.page.js'

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

    await RegistrationReprocessorWhatAddressRegulatorServesToPage.enterAddress(
      address
    )
    await RegistrationReprocessorWhatAddressRegulatorServesToPage.continue()
  })
})
