import { browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import { checkBodyText } from '../support/checks.js'
import {
  createAndRegisterDefraIdUser,
  createLinkedOrganisation,
  linkDefraIdUser,
  updateMigratedOrganisation
} from '../support/apicalls.js'
import DashboardPage from 'page-objects/dashboard.page.js'

describe('Registration Only', () => {
  it('Should not display Registration that do not have Accreditation associated @registration', async () => {
    const organisationDetails = await createLinkedOrganisation([
      {
        material: 'Paper or board (R3)',
        wasteProcessingType: 'Reprocessor',
        withoutAccreditation: true
      },
      {
        material: 'Paper or board (R3)',
        wasteProcessingType: 'Reprocessor',
        withoutAccreditation: true
      },
      {
        material: 'Paper or board (R3)',
        wasteProcessingType: 'Exporter',
        withoutAccreditation: true
      }
    ])

    const userEmail = await updateMigratedOrganisation(
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
          reprocessingType: 'input',
          regNumber: 'RI25SR5111050912PA',
          accNumber: 'ACCI123456',
          status: 'approved',
          withoutAccreditation: true
        },
        {
          regNumber: 'E25SR500030913PA',
          accNumber: 'ACC234567',
          status: 'approved',
          withoutAccreditation: true
        }
      ]
    )
    const user = await createAndRegisterDefraIdUser(userEmail)

    await linkDefraIdUser(organisationDetails.refNo, user.userId, userEmail)

    await HomePage.openStart()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(userEmail)

    await checkBodyText('No sites found.', 10)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('Should display Registrations that have Accreditation associated @registrationOnly', async () => {
    const organisationDetails = await createLinkedOrganisation([
      {
        material: 'Paper or board (R3)',
        wasteProcessingType: 'Reprocessor',
        withoutAccreditation: true
      },
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
      },
      {
        material: 'Wood (R3)',
        wasteProcessingType: 'Exporter'
      }
    ])

    const userEmail = await updateMigratedOrganisation(
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
          reprocessingType: 'input',
          regNumber: 'RI25SR5111050912PA',
          accNumber: 'ACCI123456',
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
        },
        {
          regNumber: 'E25SR5000309132WO',
          accNumber: 'ACC2345678',
          status: 'approved'
        }
      ]
    )
    const user = await createAndRegisterDefraIdUser(userEmail)

    await linkDefraIdUser(organisationDetails.refNo, user.userId, userEmail)

    await HomePage.openStart()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(userEmail)

    let material = await DashboardPage.getMaterial(1, 1)
    expect(material).toBe('Fibre-based composite')

    let numberOfRows = await DashboardPage.getNumberOfRows(1)
    expect(numberOfRows).toBe(1)

    material = await DashboardPage.getMaterial(2, 1)
    expect(material).toBe('Plastic')
    numberOfRows = await DashboardPage.getNumberOfRows(2)
    expect(numberOfRows).toBe(1)

    await DashboardPage.selectExportingTab()
    material = await DashboardPage.getMaterial(1, 1)
    expect(material).toBe('Wood')
    numberOfRows = await DashboardPage.getNumberOfRows(1)
    expect(numberOfRows).toBe(1)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
