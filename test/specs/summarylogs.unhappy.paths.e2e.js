import { $, browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import UploadSummaryLogPage from '../page-objects/upload.summary.log.page.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import {
  checkBodyText,
  checkBodyTextDoesNotInclude,
  checkUploadErrorText
} from '../support/checks.js'
import {
  createAndRegisterDefraIdUser,
  createLinkedOrganisation,
  updateMigratedOrganisation,
  linkDefraIdUser
} from '../support/apicalls.js'

describe('Summary Logs - Unhappy paths @unhappyPaths', () => {
  it('Should get an error message with an empty Summary Log spreadsheet @emptyMessage', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor' }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: 'R25SR5111050912PA',
          accNumber: 'ACC123888',
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

    await DashboardPage.selectLink(1)
    await WasteRecordsPage.submitSummaryLogLink()

    await UploadSummaryLogPage.uploadFile('resources/empty.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your summary log is being checked', 30)

    await checkUploadErrorText(
      '#main-content > div > div:nth-child(2) > div > div > p.govuk-body.govuk-\\!-font-weight-bold',
      "The summary log template you're uploading is incorrect - make sure you download the correct template for your registration or accreditation",
      30
    )

    await UploadSummaryLogPage.continue()
    await checkUploadErrorText(
      '#main-content > div > div:nth-child(2) > div > div > p.govuk-body.govuk-\\!-font-weight-bold',
      "The summary log template you're uploading is incorrect - make sure you download the correct template for your registration or accreditation",
      30
    )

    await UploadSummaryLogPage.returnToSubmissionPage()
    const regNo = await $('//a[normalize-space()="R25SR5111050912PA"]')
    expect(regNo).toExist()

    const accNo = await $('//a[normalize-space()="ACC123888"]')
    expect(accNo).toExist()

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('Should get an error message with a Summary Log spreadsheet that does not conform to template requirements @invalidTemplate', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor' }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: 'R25SR5111050912PA',
          accNumber: 'ACC123456',
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

    await HomePage.open()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(migrationResponse.email)

    await DashboardPage.selectLink(1)
    await WasteRecordsPage.submitSummaryLogLink()

    await UploadSummaryLogPage.continue()
    await expect(browser).toHaveTitle(
      expect.stringContaining('Summary log: upload')
    )

    // Prevent from uploading too quickly after clicking continue previously
    await browser.pause(500)

    await UploadSummaryLogPage.uploadFile('resources/bad-marker.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your summary log is being checked', 30)

    await checkBodyText(
      "The summary log template you're uploading is incorrect - make sure you download the correct template for your registration or accreditation",
      60
    )

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('Should show per-cell validation error detail for each failing cell @summLogsValidationErrors', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Exporter' }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          regNumber: 'E25SR500020912PA',
          accNumber: 'E-ACC12245PA',
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

    await HomePage.open()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(migrationResponse.email)

    await DashboardPage.selectLink(1)
    await WasteRecordsPage.submitSummaryLogLink()

    await expect(browser).toHaveTitle(
      expect.stringContaining('Summary log: upload')
    )

    await UploadSummaryLogPage.uploadFile('resources/exporter-invalid.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your summary log is being checked', 30)

    await checkBodyText('Your summary log cannot be uploaded', 60)

    await checkBodyText('errors in your summary log', 60)
    await checkBodyText(
      "You'll need to fix all of your summary log errors before you can upload this file.",
      30
    )

    const validationErrors = await UploadSummaryLogPage.getValidationErrors()
    const expectedErrors = [
      {
        rowId: '1000',
        section: 'Exported (sections 1, 2 and 3)',
        columnHeader: 'Date received for export',
        cell: 'G4',
        dataEntered: '????',
        errorMessage: 'Must be a valid date in the format dd/mm/yyyy'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Description of waste',
        cell: 'I4',
        dataEntered: 'WrongDesc',
        errorMessage: 'Select a value from the drop-down list'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Were PRN or PERN issued on this waste',
        cell: 'J4',
        dataEntered: 'Unknown',
        errorMessage: 'Must be Yes or No'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Gross weight',
        cell: 'K4',
        dataEntered: '1010',
        errorMessage: 'Must be 1,000 or less'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Tare weight',
        cell: 'L4',
        dataEntered: '-10',
        errorMessage: 'Must be 0 or more'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Pallet weight',
        cell: 'M4',
        dataEntered: '-50',
        errorMessage: 'Must be 0 or more'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Net weight',
        cell: 'N4',
        dataEntered: '-50',
        errorMessage: 'Must be 0 or more'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Bailing wire protocol',
        cell: 'O4',
        dataEntered: 'Invalid',
        errorMessage: 'Must be Yes or No'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'How did you calculate recyclable proportion',
        cell: 'P4',
        dataEntered: 'Invalid',
        errorMessage: 'Select a value from the drop-down list'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Weight of non-target materials',
        cell: 'Q4',
        dataEntered: '1005',
        errorMessage: 'Must be 1,000 or less'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Recyclable proportion percentage',
        cell: 'R4',
        dataEntered: '1.1',
        errorMessage: 'Must be 1 or less'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Tonnage received for export',
        cell: 'S4',
        dataEntered: '-1160.5',
        errorMessage: 'Must be 0 or more'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Tonnage of UK packaging waste exported',
        cell: 'T4',
        dataEntered: '1002',
        errorMessage: 'Must be 1,000 or less'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Date of export',
        cell: 'U4',
        dataEntered: 'TBC',
        errorMessage: 'Must be a valid date in the format dd/mm/yyyy'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Basel export code',
        cell: 'V4',
        dataEntered: 'NotABasel',
        errorMessage: 'Select a value from the drop-down list'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Customs codes',
        cell: 'W4',
        dataEntered:
          'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789098765432101234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789098765432101234567890',
        errorMessage: 'Must be 100 characters or fewer'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Container number',
        cell: 'X4',
        dataEntered:
          'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789098765432101234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789098765432101234567890',
        errorMessage: 'Must be 100 characters or fewer'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Date received by OSR',
        cell: 'Y4',
        dataEntered: '30-02-2025',
        errorMessage: 'Check this value'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'OSR ID',
        cell: 'Z4',
        dataEntered: '98A',
        errorMessage: 'Must be a 3-digit number'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Did waste pass through an interim site',
        cell: 'AA4',
        dataEntered: 'notValid',
        errorMessage: 'Must be Yes or No'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Tonnage passed to interim site received by OSR',
        cell: 'AC4',
        dataEntered: '-50',
        errorMessage: 'Must be 0 or more'
      },
      {
        rowId: '4000',
        section: 'Sent on (sections 4 and 5)',
        columnHeader: 'Date load left site',
        cell: 'G4',
        dataEntered: '???',
        errorMessage: 'Must be a valid date in the format dd/mm/yyyy'
      },
      {
        rowId: '',
        section: '',
        columnHeader: 'Tonnage of UK packaging waste sent on',
        cell: 'H4',
        dataEntered: 'ABC',
        errorMessage: 'Must be a number'
      }
    ]

    expect(validationErrors).toEqual(expectedErrors)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('Should get cover sheet validation error messages @coverValidationErrors', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Exporter' }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          regNumber: 'E25SR500020912PP',
          accNumber: 'E-ACC12245PP',
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

    await HomePage.open()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(migrationResponse.email)

    await DashboardPage.selectLink(1)

    const regNo = await $('//a[normalize-space()="E25SR500020912PP"]')
    expect(regNo).toExist()

    const accNo = await $('//a[normalize-space()="E-ACC12245PP"]')
    expect(accNo).toExist()

    await WasteRecordsPage.submitSummaryLogLink()

    await expect(browser).toHaveTitle(
      expect.stringContaining('Summary log: upload')
    )

    const uploadInput = await $('#summary-log-upload')
    await uploadInput.waitForExist({ timeout: 10000 })

    await UploadSummaryLogPage.uploadFile('resources/cover-invalid.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your summary log is being checked', 30)

    await checkBodyText(
      "Material on summary log's 'Cover' tab is missing or incorrect",
      60
    )
    await checkBodyText(
      "Registration number on summary log's 'Cover' tab is missing or incorrect",
      60
    )
    await checkBodyText(
      "Accreditation number on summary log's 'Cover' tab is missing or incorrect",
      60
    )

    await checkBodyTextDoesNotInclude(
      'Sorry, there is a problem with the service - try again later',
      60
    )

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
