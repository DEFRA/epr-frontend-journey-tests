import CheckBeforeCreatingPrnPage from 'page-objects/check.before.creating.prn.page.js'
import { expect } from '@wdio/globals'
import PrnViewPage from 'page-objects/prn.view.page.js'
import CreatePRNPage from 'page-objects/create.prn.page.js'
import PrnDashboardPage from 'page-objects/prn.dashboard.page.js'
import PrnIssuedPage from 'page-objects/prn.issued.page.js'
import { todayddMMMMyyyy } from '~/test/support/date.js'
import PrnCreatedPage from 'page-objects/prn.created.page.js'
import ConfirmCancelPrnPage from 'page-objects/confirm.cancel.prn.page.js'
import PrnCancelledPage from 'page-objects/prn.cancelled.page.js'

export class PrnHelper {
  constructor(isPern = false) {
    this.prnWording = isPern ? 'PERN' : 'PRN'
    this.isPern = isPern
  }

  async checkPrnDetails(expectedPrnDetails) {
    const prnDetails = await CheckBeforeCreatingPrnPage.prnDetails()
    expect(prnDetails['Issuer']).toBe(
      expectedPrnDetails.organisationDetails.organisation.companyName
    )
    expect(prnDetails['Packaging waste producer or compliance scheme']).toBe(
      expectedPrnDetails.tradingName
    )
    expect(prnDetails['Tonnage']).toBe(
      `${expectedPrnDetails.tonnageWordings.integer}`
    )
    expect(prnDetails['Tonnage in words']).toBe(
      expectedPrnDetails.tonnageWordings.word
    )
    expect(prnDetails['Process to be used']).toBe(expectedPrnDetails.process)
    expect(prnDetails['Issuer notes']).toBe(
      expectedPrnDetails.issuerNotesToCheck
    )

    const accreditationDetails =
      await CheckBeforeCreatingPrnPage.accreditationDetails()

    expect(accreditationDetails['Material']).toBe(
      expectedPrnDetails.materialDesc
    )
    expect(accreditationDetails['Accreditation number']).toBe(
      expectedPrnDetails.accNumber
    )
    if (!this.isPern) {
      expect(
        accreditationDetails['Reprocessing site address'].replaceAll(', ', ',')
      ).toBe(expectedPrnDetails.regAddress)
    }
  }

  async checkViewPrnDetails(expectedPrnDetails) {
    const headingText = await PrnViewPage.headingText()
    if (!this.isPern) {
      expect(headingText).toBe('Packaging Waste Recycling Note')
    } else {
      expect(headingText).toBe('Packaging Waste Export Recycling Note')
    }
    const prnViewDetails = await PrnViewPage.prnDetails()
    expect(prnViewDetails[`${this.prnWording} number`]).toBe(
      expectedPrnDetails.prnNumber
    )
    expect(
      prnViewDetails['Packaging waste producer or compliance scheme']
    ).toBe(expectedPrnDetails.tradingName)
    expect(prnViewDetails['Tonnage']).toBe(
      `${expectedPrnDetails.tonnageWordings.integer}`
    )
    expect(prnViewDetails['Issuer notes']).toBe(expectedPrnDetails.issuerNotes)
    expect(prnViewDetails['Issued date']).toBe(expectedPrnDetails.issuedDate)
    expect(prnViewDetails['Status']).toBe(expectedPrnDetails.status)
    expect(prnViewDetails['December waste']).toBe('No')
    expect(prnViewDetails['Tonnage in words']).toBe(
      expectedPrnDetails.tonnageWordings.word
    )
    expect(prnViewDetails['Process to be used']).toBe(
      expectedPrnDetails.process
    )

    const accreditationViewDetails = await PrnViewPage.accreditationDetails()
    expect(accreditationViewDetails['Material']).toBe(
      expectedPrnDetails.materialDesc
    )
    expect(accreditationViewDetails['Accreditation number']).toBe(
      expectedPrnDetails.accNumber
    )
    if (!this.isPern) {
      expect(
        accreditationViewDetails['Reprocessing site address'].replaceAll(
          ', ',
          ','
        )
      ).toBe(expectedPrnDetails.regAddress)
    }
  }

  async createAndCheckPrnDetails(prnDetails) {
    await this.createAndCheckDraftPrn(prnDetails)
    await CheckBeforeCreatingPrnPage.createPRN()
    const message = await PrnCreatedPage.messageText()
    expect(message).toContain(`${this.prnWording} created`)
    expect(message).toContain('Awaiting authorisation')
    prnDetails.status = 'Awaiting authorisation'
    prnDetails.createdDate = todayddMMMMyyyy
  }

  async createAndCheckDraftPrn(prnDetails) {
    await CreatePRNPage.createPrn(
      prnDetails.tonnageWordings.integer,
      prnDetails.tradingName,
      prnDetails.issuerNotes
    )

    if (prnDetails.issuerNotes === '') {
      prnDetails.issuerNotesToCheck = 'Not provided'
    } else {
      prnDetails.issuerNotesToCheck = prnDetails.issuerNotes
    }
    const headingText = await CheckBeforeCreatingPrnPage.headingText()
    expect(headingText).toBe(`Check before creating ${this.prnWording}`)
    await this.checkPrnDetails(prnDetails)
  }

  async checkAwaitingRows(prnDetails, rowIndex, tableIndex = 1) {
    const awaitingRow = await PrnDashboardPage.getAwaitingRow(
      rowIndex,
      tableIndex
    )
    expect(awaitingRow.get('Producer or compliance scheme')).toEqual(
      prnDetails.tradingName
    )
    expect(awaitingRow.get('Date created')).toEqual(prnDetails.createdDate)
    expect(awaitingRow.get('Tonnage')).toEqual(
      `${prnDetails.tonnageWordings.integer}`
    )
    expect(awaitingRow.get('Status')).toEqual(prnDetails.status)
  }

  async checkIssuedRows(prnDetails, rowIndex) {
    const issuedRow = await PrnDashboardPage.getIssuedRow(rowIndex)

    expect(issuedRow.get(`${this.prnWording} number`)).toEqual(
      prnDetails.prnNumber
    )
    expect(issuedRow.get('Producer or compliance scheme')).toEqual(
      prnDetails.tradingName
    )
    expect(issuedRow.get('Date issued')).toEqual(prnDetails.issuedDate)
    expect(issuedRow.get('Status')).toEqual(prnDetails.status)
  }

  async issuePrnAndUpdateDetails(prnDetails, prnPrefix = 'SR') {
    await PrnViewPage.issuePRNButton()

    const awaitingAcceptanceStatus = 'Awaiting acceptance'
    const prnIssuedText = await PrnIssuedPage.messageText()

    expect(prnIssuedText).toContain(
      `${this.prnWording} issued to ` + prnDetails.tradingName
    )
    expect(prnIssuedText).toContain(`${this.prnWording} number:`)
    const prnNumber = await PrnIssuedPage.prnNumberText()
    const prnNoPattern = new RegExp(`${prnPrefix}\\d{5,9}`)
    expect(prnNoPattern.test(prnNumber)).toEqual(true)

    prnDetails.status = awaitingAcceptanceStatus
    prnDetails.issuedDate = todayddMMMMyyyy
    prnDetails.prnNumber = prnNumber
  }

  async checkIssuedPageLinks() {
    const managePRNsElement = await PrnIssuedPage.managePRNs()
    const issueAnotherPRNElement = await PrnIssuedPage.issueAnotherPRN()
    expect(managePRNsElement.getAttribute('href')).toEqual(
      issueAnotherPRNElement.getAttribute('href')
    )
  }

  async cancelPRNAndReturnToPRNsDashboard() {
    await PrnViewPage.cancelPRNButton()
    const confirmCancelHeading = await ConfirmCancelPrnPage.headingText()
    expect(confirmCancelHeading).toBe(
      `Confirm cancellation of this ${this.prnWording}`
    )

    await ConfirmCancelPrnPage.confirmCancelPrn()
    const cancelledMessageText = await PrnCancelledPage.messageText()
    expect(cancelledMessageText).toContain(`${this.prnWording} cancelled`)

    const prnStatus = await PrnCancelledPage.statusText()
    expect(prnStatus).toContain('Cancelled')
    if (!this.isPern) {
      await PrnCancelledPage.prnsPage()
    } else {
      await PrnCancelledPage.pernsPage()
    }
  }
}
