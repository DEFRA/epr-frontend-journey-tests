import { browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import {
  seedOverseasSites,
  createAndRegisterDefraIdUser,
  createLinkedOrganisation,
  linkDefraIdUser,
  updateMigratedOrganisation
} from '../support/apicalls.js'
import ReportsPage from 'page-objects/reports/reports.page.js'

describe('Report only shows from accreditation validFrom date — exporter @validFromReport', () => {
  const regNumber = 'E25SR500020912PA'
  const accNumber = 'E-ACC12245PA'

  let organisationDetails
  let migrationResponse
  let user

  it('displays active report as of this month only @validFromReport', async () => {
    organisationDetails = await createLinkedOrganisation([
      {
        material: 'Paper or board (R3)',
        wasteProcessingType: 'Exporter'
      }
    ])

    const dateToday = new Date(
      new Date().setMonth(new Date().getMonth() - 1)
    ).toLocaleDateString('en-CA')

    migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [{ regNumber, accNumber, status: 'approved' }],
      undefined,
      dateToday
    )

    await seedOverseasSites(organisationDetails.refNo)

    user = await createAndRegisterDefraIdUser(migrationResponse.email)
    await linkDefraIdUser(
      organisationDetails.refNo,
      user.userId,
      migrationResponse.email
    )

    await HomePage.openStart()
    await HomePage.clickStartNow()
    await DefraIdStubPage.loginViaEmail(migrationResponse.email)

    await DashboardPage.selectTableLink(1, 1)
    await WasteRecordsPage.manageReportsLink()
    const activeReports = await ReportsPage.getActiveNumberOfRows()
    expect(activeReports).toBe(1)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
