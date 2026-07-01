import { $, browser, expect } from '@wdio/globals'
import DefraIdStubPage from 'page-objects/defra.id.stub.page.js'
import HomePage from 'page-objects/homepage.js'
import UploadSummaryLogPage from '../page-objects/upload.summary.log.page.js'
import EnhancedCheckSummaryLogPage from '../page-objects/enhanced.check.summary.log.page.js'
import WasteRecordsPage from '../page-objects/waste.records.page.js'
import DashboardPage from '../page-objects/dashboard.page.js'
import {
  checkBodyText,
  checkBodyTextDoesNotInclude
} from '../support/checks.js'
import {
  seedOverseasSites,
  createAndRegisterDefraIdUser,
  createLinkedOrganisation,
  linkDefraIdUser,
  updateMigratedOrganisation,
  seedSubmittedReport
} from '../support/apicalls.js'

// The adjusted-loads accordion message varies by singular/plural and by whether
// the load added to or reduced the balance, so it stays a pattern, not an exact string.
const ADJUSTED_ACCORDION_MSG =
  /(has|have) all the required summary log data and (has|have) (added to|reduced) your waste balance|(does|do) NOT have all the required summary log data and (has|have) reduced your waste balance/

// PAE-1648 closed-period adjustment messaging copy (en.json
// summary-log:closedPeriodAdjustments). Asserted verbatim so the tests fail if
// the copy drifts from the approved design.
const IMPORTANT_BODY =
  "If you upload this summary log, you'll need to create a new report for any relevant period and an approved person from your business will need to resubmit it to your regulator."
const FURTHER_ACTION_HEADING = 'Further action needed'
const FURTHER_ACTION_PARA_1 =
  "Data from a period that you had already reported on has been changed, so you'll need to create a new report."
const FURTHER_ACTION_PARA_2 =
  'Once the new report has been created, an approved person from your business will need to submit it to your regulator.'
const FURTHER_ACTION_PARA_3 =
  "Reports that need to be resubmitted to your regulator show the status 'Requires resubmission' on the reports page."

describe('Summary Logs - Enhanced Check Page with CMA Detection', () => {
  // Resets the shared browser session between tests. Without it, leftover auth
  // state makes a later "start now" auto-log-in and skip the stub's user-selection
  // page, so loginViaEmail times out (passes solo, fails in suite). deleteCookies
  // alone was not enough.
  afterEach(async () => {
    await browser.reloadSession()
  })

  it('should not display closed period sections when uploading loads only to open periods @noClosedSection @enhancedCheck @cma', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor' },
      { material: 'Paper or board (R3)', wasteProcessingType: 'Exporter' }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: 'R25SR5111050912PA',
          accNumber: 'ACC123456',
          status: 'approved'
        },
        {
          regNumber: 'E25SR500030913PA',
          accNumber: 'ACC234567',
          status: 'approved',
          validFrom: '2025-02-02'
        }
      ]
    )
    await seedOverseasSites(
      organisationDetails.refNo,
      [1],
      [124, 183, 512, 876]
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

    await DashboardPage.selectExportingTab()
    await DashboardPage.selectLink(1)

    await WasteRecordsPage.submitSummaryLogLink()

    await UploadSummaryLogPage.uploadFile('resources/exporter.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your summary log is being checked', 30)
    await checkBodyText('Upload your summary log', 60)

    await checkBodyText('Open periods: new loads', 30)
    const subStates = (
      await EnhancedCheckSummaryLogPage.allSubStateHeadings()
    ).join(' | ')
    expect(subStates).toContain(
      '2 new loads will be recorded (and will add to your waste balance)'
    )
    expect(subStates).toContain(
      '1 new load will be recorded (but will NOT add to your waste balance)'
    )

    const bodyText = await browser.execute(() => document.body.innerText)
    expect(bodyText).toContain(
      'The new loads will add 30.00 tonnes to your waste balance.'
    )

    await checkBodyTextDoesNotInclude('Closed periods: new loads', 5)
    await checkBodyTextDoesNotInclude('Closed periods: adjusted loads', 5)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('should display empty state for file with no changes @enhancedEmptyState @enhancedCheck @cma', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Steel (R4)', wasteProcessingType: 'Reprocessor' }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: 'R25SR500050912PA',
          accNumber: 'ACC500591',
          status: 'approved',
          validFrom: '2026-01-01'
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

    const dashboardHeaderText = await DashboardPage.dashboardHeaderText()

    expect(dashboardHeaderText).toContain(
      organisationDetails.organisation.companyName
    )

    await DashboardPage.selectLink(1)

    const regNo = await $('//a[normalize-space()="R25SR500050912PA"]')
    expect(regNo).toExist()

    await WasteRecordsPage.submitSummaryLogLink()
    await UploadSummaryLogPage.performUploadAndReturnToHomepage(
      'resources/reprocessor-output.xlsx'
    )

    await DashboardPage.selectLink(1)
    await WasteRecordsPage.submitSummaryLogLink()
    await UploadSummaryLogPage.uploadFile('resources/reprocessor-output.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your summary log is being checked', 30)
    await checkBodyText('Upload your summary log', 60)

    await checkBodyText('No new loads have been added to your open period', 30)
    await checkBodyText('No adjustments have been made to your open period', 30)
    await checkBodyText(
      'No new loads have been added to your closed periods',
      30
    )
    await checkBodyText(
      'No adjustments have been made to your closed periods',
      30
    )

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('should display the closed period section when CMAs are detected @cmaDetected @enhancedCheck @cma', async () => {
    const organisationDetails = await createLinkedOrganisation([
      {
        material: 'Paper or board (R3)',
        wasteProcessingType: 'Reprocessor',
        withoutAccreditation: true
      }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: 'R25SR500040912PA',
          status: 'approved',
          withoutAccreditation: true
        }
      ]
    )

    const user = await createAndRegisterDefraIdUser(migrationResponse.email)
    await linkDefraIdUser(
      organisationDetails.refNo,
      user.userId,
      migrationResponse.email
    )

    const regId = migrationResponse.registrationIds[0]

    await seedSubmittedReport(
      organisationDetails.refNo,
      regId,
      user.userId,
      2026,
      'quarterly',
      1,
      1,
      { tonnageRecycled: 100, tonnageNotRecycled: 0 }
    )

    await HomePage.open()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(migrationResponse.email)

    await DashboardPage.selectLink(1)

    await WasteRecordsPage.submitSummaryLogLink()

    await UploadSummaryLogPage.uploadFile(
      'resources/reprocessor-output-regonly-cma.xlsx'
    )
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your summary log is being checked', 30)
    await checkBodyText('Upload your summary log', 60)

    await checkBodyText('Closed periods: new loads', 30)
    const subStates = (
      await EnhancedCheckSummaryLogPage.allSubStateHeadings()
    ).join(' | ')
    expect(subStates).toContain('8 new loads will be recorded')
    await checkBodyText('These have been added to your summary log.', 30)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('should display closed period adjusted loads when a reported load is amended @cmaAdjusted @enhancedCheck @cma', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor' },
      { material: 'Paper or board (R3)', wasteProcessingType: 'Exporter' }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: 'R25SR5111050912PA',
          accNumber: 'ACC123456',
          status: 'approved'
        },
        {
          regNumber: 'E25SR500030913PA',
          accNumber: 'ACC234567',
          status: 'approved',
          validFrom: '2025-02-02'
        }
      ]
    )
    await seedOverseasSites(
      organisationDetails.refNo,
      [1],
      [124, 183, 512, 876]
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

    await DashboardPage.selectExportingTab()
    await DashboardPage.selectLink(1)

    await WasteRecordsPage.submitSummaryLogLink()
    await UploadSummaryLogPage.performUploadAndReturnToHomepage(
      'resources/exporter.xlsx'
    )

    const exporterRegId = migrationResponse.registrationIds[1]
    await seedSubmittedReport(
      organisationDetails.refNo,
      exporterRegId,
      user.userId,
      2026,
      'monthly',
      1,
      1,
      { prnRevenue: 100, freeTonnage: 0 }
    )

    await DashboardPage.selectExportingTab()
    await DashboardPage.selectLink(1)
    await WasteRecordsPage.submitSummaryLogLink()
    await UploadSummaryLogPage.uploadFile('resources/exporter-adjustments.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your summary log is being checked', 30)
    await checkBodyText('Upload your summary log', 60)

    await checkBodyText('Closed periods: adjusted loads', 30)

    const sections = await EnhancedCheckSummaryLogPage.allSectionHeadings()
    expect(sections).toEqual(
      expect.arrayContaining([
        'Open periods: new loads',
        'Closed periods: new loads',
        'Closed periods: adjusted loads'
      ])
    )

    const subStates = (
      await EnhancedCheckSummaryLogPage.allSubStateHeadings()
    ).join(' | ')
    expect(subStates).toContain(
      '1 new load will be recorded (and will add to your waste balance)'
    )
    expect(subStates).toContain(
      '2 new loads will be recorded (and will add to your waste balance)'
    )
    expect(subStates).toContain(
      '1 new load will be recorded (but will NOT add to your waste balance)'
    )
    expect(subStates).toContain(
      '1 adjusted load will be recorded (and will reflect in your waste balance)'
    )
    expect(subStates).toContain(
      '1 change is NOT relevant to your waste balance'
    )

    // Guard on the projection (renders last, at page bottom) so the raw read
    // below isn't taken mid-parse; the expect()s keep the value diagnostics.
    await checkBodyText(
      'If you upload this summary log to create a new report, your waste balance will be 139.00 (from 30.00)',
      10
    )
    const bodyText = await browser.execute(() => document.body.innerText)
    // Open and closed new-loads sections each render their own caption, so two
    // "new loads will add" lines are expected here, not one.
    expect(bodyText).toContain(
      'The new loads will add 49.00 tonnes to your waste balance.'
    )
    expect(bodyText).toContain(
      'The new loads will add 50.00 tonnes to your waste balance.'
    )
    expect(bodyText).toContain(
      'The adjusted loads will add 10.00 tonnes to your waste balance.'
    )
    expect(bodyText).toContain(
      'The loads include all the required summary log data.'
    )
    expect(bodyText).toContain(
      'These loads could be missing required summary log data that stops them from adding to your waste balance.'
    )
    expect(bodyText).toContain('depending on the adjustment.')
    expect(bodyText).toContain(
      'If you upload this summary log to create a new report, your waste balance will be 139.00 (from 30.00)'
    )

    await EnhancedCheckSummaryLogPage.expandAllLoadDetails()
    const rows = await EnhancedCheckSummaryLogPage.loadRowItems()
    expect(rows.some((r) => r.includes('Row ID'))).toBe(true)
    const detailsText = await EnhancedCheckSummaryLogPage.loadDetailsText()
    expect(detailsText).toMatch(ADJUSTED_ACCORDION_MSG)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('should display open period adjusted loads and sub-states with accordions @openAdjusted @enhancedCheck @cma', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor' },
      { material: 'Paper or board (R3)', wasteProcessingType: 'Exporter' }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: 'R25SR5111050912PA',
          accNumber: 'ACC123456',
          status: 'approved'
        },
        {
          regNumber: 'E25SR500030913PA',
          accNumber: 'ACC234567',
          status: 'approved',
          validFrom: '2025-02-02'
        }
      ]
    )
    await seedOverseasSites(
      organisationDetails.refNo,
      [1],
      [124, 183, 512, 876]
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

    await DashboardPage.selectExportingTab()
    await DashboardPage.selectLink(1)

    await WasteRecordsPage.submitSummaryLogLink()
    await UploadSummaryLogPage.performUploadAndReturnToHomepage(
      'resources/exporter.xlsx'
    )

    await DashboardPage.selectExportingTab()
    await DashboardPage.selectLink(1)
    await WasteRecordsPage.submitSummaryLogLink()
    await UploadSummaryLogPage.uploadFile('resources/exporter-adjustments.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your summary log is being checked', 30)
    await checkBodyText('Upload your summary log', 60)
    await checkBodyText('Open periods: adjusted loads', 30)

    const sections = await EnhancedCheckSummaryLogPage.allSectionHeadings()
    expect(sections).toEqual(
      expect.arrayContaining([
        'Open periods: new loads',
        'Open periods: adjusted loads'
      ])
    )

    const subStates = (
      await EnhancedCheckSummaryLogPage.allSubStateHeadings()
    ).join(' | ')
    expect(subStates).toContain(
      '3 new loads will be recorded (and will add to your waste balance)'
    )
    expect(subStates).toContain(
      '1 new load will be recorded (but will NOT add to your waste balance)'
    )
    expect(subStates).toContain(
      '1 adjusted load will be recorded (and will reflect in your waste balance)'
    )
    expect(subStates).toContain(
      '1 change is NOT relevant to your waste balance'
    )

    // Guard on the projection (renders last, at page bottom) so the raw read
    // below isn't taken mid-parse; the expect()s keep the value diagnostics.
    await checkBodyText(
      'If you upload this summary log to create a new report, your waste balance will be 139.00 (from 30.00)',
      10
    )
    const bodyText = await browser.execute(() => document.body.innerText)
    expect(bodyText).toContain(
      'The new loads will add 99.00 tonnes to your waste balance.'
    )
    expect(bodyText).toContain(
      'The adjusted loads will add 10.00 tonnes to your waste balance.'
    )
    expect(bodyText).toContain(
      'The loads include all the required summary log data.'
    )
    expect(bodyText).toContain(
      'These loads could be missing required summary log data that stops them from adding to your waste balance.'
    )
    expect(bodyText).toContain('depending on the adjustment.')
    expect(bodyText).toContain(
      'If you upload this summary log to create a new report, your waste balance will be 139.00 (from 30.00)'
    )

    await EnhancedCheckSummaryLogPage.expandAllLoadDetails()
    const rows = await EnhancedCheckSummaryLogPage.loadRowItems()
    expect(rows.some((r) => r.includes('Row ID'))).toBe(true)
    const detailsText = await EnhancedCheckSummaryLogPage.loadDetailsText()
    expect(detailsText).toMatch(ADJUSTED_ACCORDION_MSG)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('should display the registered-only adjusted-loads copy @regOnlyAdjusted @enhancedCheck @cma', async () => {
    const organisationDetails = await createLinkedOrganisation([
      {
        material: 'Paper or board (R3)',
        wasteProcessingType: 'Reprocessor',
        withoutAccreditation: true
      }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: 'R25SR5111050912PA',
          status: 'approved',
          withoutAccreditation: true
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
    await UploadSummaryLogPage.performUploadAndReturnToHomepage(
      'resources/reprocessor-output-regonly.xlsx'
    )

    await DashboardPage.selectLink(1)
    await WasteRecordsPage.submitSummaryLogLink()
    await UploadSummaryLogPage.uploadFile(
      'resources/reprocessor-output-regonly-adjustments.xlsx'
    )
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your summary log is being checked', 30)
    await checkBodyText('Upload your summary log', 60)
    await checkBodyText('Open periods: adjusted loads', 30)

    const subStates = (
      await EnhancedCheckSummaryLogPage.allSubStateHeadings()
    ).join(' | ')
    expect(subStates).toContain('1 adjusted load will be recorded')
    await checkBodyText('These have been added to your summary log.', 30)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('should not display open period sections when all loads are in closed periods @noOpenSection @enhancedCheck @cma', async () => {
    const organisationDetails = await createLinkedOrganisation([
      {
        material: 'Paper or board (R3)',
        wasteProcessingType: 'Reprocessor',
        withoutAccreditation: true
      }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: 'R25SR500040912PA',
          status: 'approved',
          withoutAccreditation: true,
          validFrom: '2025-01-01'
        }
      ]
    )

    const user = await createAndRegisterDefraIdUser(migrationResponse.email)
    await linkDefraIdUser(
      organisationDetails.refNo,
      user.userId,
      migrationResponse.email
    )

    const regId = migrationResponse.registrationIds[0]

    await seedSubmittedReport(
      organisationDetails.refNo,
      regId,
      user.userId,
      2025,
      'quarterly',
      1,
      1,
      { tonnageRecycled: 100, tonnageNotRecycled: 0 }
    )

    await HomePage.open()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(migrationResponse.email)

    await DashboardPage.selectLink(1)

    await WasteRecordsPage.submitSummaryLogLink()

    await UploadSummaryLogPage.uploadFile(
      'resources/reprocessor-output-regonly-cma-2025.xlsx'
    )
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your summary log is being checked', 30)
    await checkBodyText('Upload your summary log', 60)

    await checkBodyText('Closed periods:', 30)
    const subStates = (
      await EnhancedCheckSummaryLogPage.allSubStateHeadings()
    ).join(' | ')
    expect(subStates).toContain('8 new loads will be recorded')
    await checkBodyText('These have been added to your summary log.', 30)

    await checkBodyTextDoesNotInclude('Open periods: new loads', 5)
    await checkBodyTextDoesNotInclude('Open periods: adjusted loads', 5)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('should not display open period sections for an accredited operator with only closed loads @noOpenSectionAccredited @enhancedCheck @cma', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor' },
      { material: 'Paper or board (R3)', wasteProcessingType: 'Exporter' }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: 'R25SR5111050912PA',
          accNumber: 'ACC123456',
          status: 'approved'
        },
        {
          regNumber: 'E25SR500030913PA',
          accNumber: 'ACC234567',
          status: 'approved',
          validFrom: '2025-01-01'
        }
      ]
    )
    await seedOverseasSites(
      organisationDetails.refNo,
      [1],
      [124, 183, 512, 876]
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

    await DashboardPage.selectExportingTab()
    await DashboardPage.selectLink(1)

    await WasteRecordsPage.submitSummaryLogLink()
    await UploadSummaryLogPage.performUploadAndReturnToHomepage(
      'resources/exporter-2025.xlsx'
    )

    const exporterRegId = migrationResponse.registrationIds[1]
    await seedSubmittedReport(
      organisationDetails.refNo,
      exporterRegId,
      user.userId,
      2025,
      'monthly',
      1,
      1,
      { prnRevenue: 100, freeTonnage: 0 }
    )

    await DashboardPage.selectExportingTab()
    await DashboardPage.selectLink(1)
    await WasteRecordsPage.submitSummaryLogLink()
    await UploadSummaryLogPage.uploadFile(
      'resources/exporter-adjustments-2025.xlsx'
    )
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your summary log is being checked', 30)
    await checkBodyText('Upload your summary log', 60)

    await checkBodyText('Closed periods:', 30)
    const subStates = (
      await EnhancedCheckSummaryLogPage.allSubStateHeadings()
    ).join(' | ')
    expect(subStates).toContain(
      '3 new loads will be recorded (and will add to your waste balance)'
    )
    expect(subStates).toContain(
      '1 new load will be recorded (but will NOT add to your waste balance)'
    )
    expect(subStates).toContain(
      '1 adjusted load will be recorded (and will reflect in your waste balance)'
    )

    // Guard on the projection (renders last, at page bottom) so the raw read
    // below isn't taken mid-parse; the expect()s keep the value diagnostics.
    await checkBodyText(
      'If you upload this summary log to create a new report, your waste balance will be 139.00 (from 30.00)',
      10
    )
    const bodyText = await browser.execute(() => document.body.innerText)
    expect(bodyText).toContain(
      'The new loads will add 99.00 tonnes to your waste balance.'
    )
    expect(bodyText).toContain(
      'The adjusted loads will add 10.00 tonnes to your waste balance.'
    )
    expect(bodyText).toContain(
      'If you upload this summary log to create a new report, your waste balance will be 139.00 (from 30.00)'
    )

    await checkBodyTextDoesNotInclude('Open periods: new loads', 5)
    await checkBodyTextDoesNotInclude('Open periods: adjusted loads', 5)

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('should show the Important banner and Further action needed messaging when closed-period adjustments are detected @closedPeriodMessaging @enhancedCheck @cma', async () => {
    const organisationDetails = await createLinkedOrganisation([
      {
        material: 'Paper or board (R3)',
        wasteProcessingType: 'Reprocessor',
        withoutAccreditation: true
      }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: 'R25SR500040912PA',
          status: 'approved',
          withoutAccreditation: true
        }
      ]
    )

    const user = await createAndRegisterDefraIdUser(migrationResponse.email)
    await linkDefraIdUser(
      organisationDetails.refNo,
      user.userId,
      migrationResponse.email
    )

    const regId = migrationResponse.registrationIds[0]

    // Close Q1 2026 by seeding a submitted report, so the upload below lands in
    // an already-reported (closed) period and triggers the messaging.
    await seedSubmittedReport(
      organisationDetails.refNo,
      regId,
      user.userId,
      2026,
      'quarterly',
      1,
      1,
      { tonnageRecycled: 100, tonnageNotRecycled: 0 }
    )

    await HomePage.open()
    await HomePage.clickStartNow()

    await DefraIdStubPage.loginViaEmail(migrationResponse.email)

    await DashboardPage.selectLink(1)

    await WasteRecordsPage.submitSummaryLogLink()

    await UploadSummaryLogPage.uploadFile(
      'resources/reprocessor-output-regonly-cma.xlsx'
    )
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your summary log is being checked', 30)
    await checkBodyText('Upload your summary log', 60)

    // AC1: the "Important" banner is shown on the check before you submit page.
    const banner = await EnhancedCheckSummaryLogPage.importantBanner()
    expect(await banner.isExisting()).toBe(true)
    const bannerText = await banner.getText()
    expect(bannerText).toContain('Important')
    expect(bannerText).toContain(IMPORTANT_BODY)

    // Submit inline (not performUploadAndReturnToHomepage, which would click
    // "Return to home" and skip the success-page assertions below).
    await EnhancedCheckSummaryLogPage.upload()

    await checkBodyText('Your waste records are being updated', 30)
    await checkBodyText('Summary log uploaded', 60)

    // AC1: the "Further action needed" section and "Go to reports" button are
    // shown on the next (success) page.
    await checkBodyText(FURTHER_ACTION_HEADING, 10)
    await checkBodyText(FURTHER_ACTION_PARA_1, 5)
    await checkBodyText(FURTHER_ACTION_PARA_2, 5)
    await checkBodyText(FURTHER_ACTION_PARA_3, 5)
    expect(await UploadSummaryLogPage.goToReportsButton().isExisting()).toBe(
      true
    )
    // The button links to the reports page for this org/registration.
    expect(
      await UploadSummaryLogPage.goToReportsButton().getAttribute('href')
    ).toBe(
      `/organisations/${organisationDetails.refNo}/registrations/${regId}/reports`
    )

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })

  it('should not show the Important banner or Further action needed messaging when no closed-period adjustments are detected @closedPeriodMessaging @enhancedCheck @cma', async () => {
    const organisationDetails = await createLinkedOrganisation([
      { material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor' },
      { material: 'Paper or board (R3)', wasteProcessingType: 'Exporter' }
    ])

    const migrationResponse = await updateMigratedOrganisation(
      organisationDetails.refNo,
      [
        {
          reprocessingType: 'output',
          regNumber: 'R25SR5111050912PA',
          accNumber: 'ACC123456',
          status: 'approved'
        },
        {
          regNumber: 'E25SR500030913PA',
          accNumber: 'ACC234567',
          status: 'approved',
          validFrom: '2025-02-02'
        }
      ]
    )
    await seedOverseasSites(
      organisationDetails.refNo,
      [1],
      [124, 183, 512, 876]
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

    await DashboardPage.selectExportingTab()
    await DashboardPage.selectLink(1)

    await WasteRecordsPage.submitSummaryLogLink()

    // Open-period loads only (no submitted report seeded), so no closed-period
    // adjustments are detected.
    await UploadSummaryLogPage.uploadFile('resources/exporter.xlsx')
    await UploadSummaryLogPage.continue()

    await checkBodyText('Your summary log is being checked', 30)
    await checkBodyText('Upload your summary log', 60)

    // AC2: the "Important" banner is not shown on the check page.
    expect(
      await EnhancedCheckSummaryLogPage.importantBanner().isExisting()
    ).toBe(false)
    await checkBodyTextDoesNotInclude(IMPORTANT_BODY, 5)

    await EnhancedCheckSummaryLogPage.upload()

    await checkBodyText('Your waste records are being updated', 30)
    await checkBodyText('Summary log uploaded', 60)

    // AC2: the "Further action needed" section and "Go to reports" button are
    // not displayed on the success page.
    await checkBodyTextDoesNotInclude(FURTHER_ACTION_HEADING, 5)
    expect(await UploadSummaryLogPage.goToReportsButton().isExisting()).toBe(
      false
    )

    await HomePage.signOut()
    await expect(browser).toHaveTitle(expect.stringContaining('Signed out'))
  })
})
