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

    await checkBodyText('Your file is being checked', 30)

    await checkUploadErrorText(
      '#main-content > div > div > div > p.govuk-body.govuk-\\!-font-weight-bold',
      "The summary log template you're uploading is incorrect - make sure you download the correct template for your registration or accreditation",
      30
    )

    await UploadSummaryLogPage.continue()
    await checkUploadErrorText(
      '#main-content > div > div > div > p.govuk-body.govuk-\\!-font-weight-bold',
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

    await checkBodyText('Your file is being checked', 30)

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

    await checkBodyText('Your file is being checked', 30)

    await checkBodyText('Your summary log cannot be uploaded', 60)

    const errorTable = await browser.$(
      '[data-testid="app-page-body"] table.govuk-table'
    )
    await errorTable.waitForExist({ timeout: 30000 })

    const errorRowCount = await browser.execute(
      () =>
        document.querySelectorAll(
          '[data-testid="app-page-body"] table.govuk-table tbody tr'
        ).length
    )

    expect(errorRowCount).toBeGreaterThan(15)

    await checkBodyText('Net weight (column N)', 30)
    await checkBodyText('Must be a number', 30)
    await checkBodyText('Must be a valid date', 30)
    await checkBodyText('Must be Yes or No', 30)
    await checkBodyText('Select a value from the drop-down list', 30)
    await checkBodyText('Contains characters that are not allowed', 30)

    await checkBodyTextDoesNotInclude(
      'The selected file contains tonnage and weight values with formats that do not match the examples provided in the summary log',
      10
    )
    await checkBodyTextDoesNotInclude(
      "The selected file contains data that's been entered incorrectly - check that the data you've entered matches the examples provided in the summary log",
      10
    )
    await checkBodyTextDoesNotInclude(
      'Sorry, there is a problem with the service - try again later',
      10
    )

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

    await checkBodyText('Your file is being checked', 30)

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
