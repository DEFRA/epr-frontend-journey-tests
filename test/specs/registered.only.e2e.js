import { expect } from '@wdio/globals'
import DashboardPage from 'page-objects/dashboard.page.js'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import WasteRecordsPage from 'page-objects/waste.records.page.js'
import {
  createAndRegisterDefraIdUser,
  createLinkedOrganisation,
  linkDefraIdUser,
  updateMigratedOrganisation
} from '../support/apicalls.js'
import {
  checkBodyText,
  checkBodyTextDoesNotInclude
} from '../support/checks.js'

describe('@registered-only', () => {
  it('should display registered-only operators alongside accredited ones', async () => {
    const organisationDetails = await createLinkedOrganisation([
      {
        material: 'Paper or board (R3)',
        wasteProcessingType: 'Reprocessor',
        withoutAccreditation: true
      },
      {
        material: 'Paper or board (R3)',
        wasteProcessingType: 'Exporter',
        withoutAccreditation: true
      },
      {
        material: 'Fibre-based composite material (R3)',
        wasteProcessingType: 'Reprocessor'
      },
      {
        material: 'Plastic (R3)',
        wasteProcessingType: 'Reprocessor'
      }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: 'R25SR5111050912PA',
          accNumber: 'ACC123456',
          status: 'approved',
          withoutAccreditation: true
        },
        {
          regNumber: 'E25SR500030913PA',
          accNumber: 'ACC234567',
          status: 'approved',
          withoutAccreditation: true
        },
        {
          reprocessingType: 'output',
          regNumber: 'R25SR5111050913FB',
          accNumber: 'ACC1234567',
          status: 'approved'
        },
        {
          reprocessingType: 'input',
          regNumber: 'RI25SR51110509124PL',
          accNumber: 'ACCI1234567',
          status: 'approved'
        }
      ]
    )
    const user = await createAndRegisterDefraIdUser(migrationResponse.email)

    await linkDefraIdUser(
      organisationDetails.refNo,
      user.userId,
      migrationResponse.email
    )

    await HomePage.openStart()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(migrationResponse.email)

    const row = await DashboardPage.getTableRow(1, 1)
    expect(row.get('Accreditation')).toBe('Not accredited')
    expect(row.get('Available waste balance (tonnes)')).toBe('Not applicable')

    let material = await DashboardPage.getMaterial(2, 1)
    expect(material).toBe('Fibre-based composite')

    material = await DashboardPage.getMaterial(3, 1)
    expect(material).toBe('Plastic')

    await DashboardPage.selectTableLink(1, 1)

    await checkBodyText('R25SR5111050912PA', 10)
    await checkBodyText('Upload your summary log', 10)
    await checkBodyTextDoesNotInclude('Available waste balance', 5)
    await checkBodyTextDoesNotInclude('Accreditation number', 5)
    await checkBodyTextDoesNotInclude('PRNs', 5)

    await WasteRecordsPage.selectBackLink()

    await DashboardPage.selectExportingTab()
    const exportRow = await DashboardPage.getTableRow(1, 1)
    expect(exportRow.get('Accreditation')).toBe('Not accredited')
    expect(exportRow.get('Available waste balance (tonnes)')).toBe(
      'Not applicable'
    )
  })
})
