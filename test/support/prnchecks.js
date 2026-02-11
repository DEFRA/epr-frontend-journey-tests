import CheckBeforeCreatingPrnPage from 'page-objects/check.before.creating.prn.page.js'
import { expect } from '@wdio/globals'
import PrnViewPage from 'page-objects/prn.view.page.js'
import CreatePRNPage from 'page-objects/create.prn.page.js'

export async function checkPrnDetails(expectedPrnDetails) {
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
  expect(prnDetails['Process to be used']).toBe('R3')
  expect(prnDetails['Issuer notes']).toBe(expectedPrnDetails.issuerNotes)

  const accreditationDetails =
    await CheckBeforeCreatingPrnPage.accreditationDetails()

  expect(accreditationDetails['Material']).toBe(expectedPrnDetails.materialDesc)
  expect(accreditationDetails['Accreditation number']).toBe(
    expectedPrnDetails.accNumber
  )
  expect(
    accreditationDetails['Accreditation address'].replaceAll(', ', ',')
  ).toBe(expectedPrnDetails.organisationDetails.regAddresses[0])
}

export async function checkViewPrnDetails(expectedPrnDetails) {
  const headingText = await PrnViewPage.headingText()
  expect(headingText).toBe('Packaging Waste Recycling Note')
  const prnViewDetails = await PrnViewPage.prnDetails()
  expect(prnViewDetails['PRN number']).toBe(expectedPrnDetails.prnNumber)
  expect(prnViewDetails['Packaging waste producer or compliance scheme']).toBe(
    expectedPrnDetails.tradingName
  )
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
  expect(prnViewDetails['Process to be used']).toBe('R3')

  const accreditationViewDetails = await PrnViewPage.accreditationDetails()
  expect(accreditationViewDetails['Material']).toBe(
    expectedPrnDetails.materialDesc
  )
  expect(accreditationViewDetails['Accreditation number']).toBe(
    expectedPrnDetails.accNumber
  )
  expect(
    accreditationViewDetails['Accreditation address'].replaceAll(', ', ',')
  ).toBe(expectedPrnDetails.organisationDetails.regAddresses[0])
}

export async function createAndCheckPrnDetails(prnDetails) {
  await CreatePRNPage.createPrn(
    prnDetails.tonnageWordings.integer,
    prnDetails.tradingName,
    prnDetails.issuerNotes
  )

  const headingText = await CheckBeforeCreatingPrnPage.headingText()
  expect(headingText).toBe('Check before creating PRN')
  await checkPrnDetails(prnDetails)
}
