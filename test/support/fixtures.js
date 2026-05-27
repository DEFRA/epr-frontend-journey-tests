import { todayddMMMMyyyy } from './date.js'

export const tradingName = 'CS_GENERATED_3982709_England'

// Actual trading name is test10 for this waste org, but as its a Large Producer, the organisation name is used instead
export const secondTradingName = 'Ball Corporation'

export const thirdTradingName =
  '13 MARLBOROUGH BUILDINGS (BATH) MANAGEMENT COMPANY LTD'

export const tonnageWordings = {
  integer: 203,
  word: 'Two hundred and three'
}

export const createPrnDetails = ({
  process = 'R3',
  materialDesc = 'Plastic',
  accNumber = '',
  tradingName = 'CS_GENERATED_3982709_England',
  issuerNotes = 'Testing',
  organisationDetails = {},
  regAddress = '',
  tonnageWordings = {
    integer: 203,
    word: 'Two hundred and three'
  }
} = {}) => {
  const companyName = organisationDetails.organisation?.companyName ?? ''
  if (regAddress === '') regAddress = organisationDetails.regAddresses?.[0]

  return {
    tonnageWordings,
    tradingName,
    issuerNotes,
    companyName,
    regAddress,
    status: '',
    materialDesc,
    accNumber,
    prnNumber: '',
    issuedDate: '',
    process,
    createdDate: todayddMMMMyyyy
  }
}
