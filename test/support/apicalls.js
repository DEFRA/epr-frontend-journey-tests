import {
  Accreditation,
  Organisation,
  Registration
} from '../support/generator.js'

import { BaseAPI } from '../apis/base-api.js'
import { expect } from '@wdio/globals'
import config from '../config/config.js'
import { AuthClient } from './auth.js'
import { fakerEN_GB } from '@faker-js/faker'
import { DefraIdStub } from './defra-id-stub.js'
import Users from './users.js'
import { setGlobalDispatcher } from 'undici'

setGlobalDispatcher(config.undiciAgent)

// Examples
// dataRows = [{ material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor'}, { material: 'Steel (R4)', wasteProcessingType: 'Exporter'}]
export async function createLinkedOrganisation(dataRows) {
  const baseAPI = new BaseAPI()

  const organisation = new Organisation()
  let payload = ''
  if (dataRows[0].wasteProcessingType === 'Reprocessor') {
    payload = organisation.toNonRegisteredUKSoleTraderPayload()
  } else {
    payload = organisation.toPayload()
  }

  let response = await baseAPI.post(
    '/v1/apply/organisation',
    JSON.stringify(payload)
  )
  expect(response.statusCode).toBe(200)

  const orgResponseData = await response.body.json()

  const orgId = orgResponseData?.orgId
  const refNo = orgResponseData?.referenceNumber

  for (const dataRow of dataRows) {
    let material = 'Paper or board (R3)'
    if (dataRow.material !== '') {
      material = dataRow.material
    }
    const registration = new Registration(orgId, refNo)
    payload =
      dataRow.wasteProcessingType === 'Reprocessor'
        ? registration.toAllMaterialsPayload(material)
        : registration.toExporterPayload(material)
    response = await baseAPI.post(
      '/v1/apply/registration',
      JSON.stringify(payload)
    )
    expect(response.statusCode).toBe(201)

    const accreditation = new Accreditation(orgId, refNo)
    accreditation.postcode = registration.postcode
    payload =
      dataRow.wasteProcessingType === 'Reprocessor'
        ? accreditation.toReprocessorPayload(material)
        : accreditation.toExporterPayload(material)

    response = await baseAPI.post(
      '/v1/apply/accreditation',
      JSON.stringify(payload)
    )
    expect(response.statusCode).toBe(201)
  }

  response = await baseAPI.post(`/v1/dev/form-submissions/${refNo}/migrate`, '')
  expect(response.statusCode).toBe(200)

  return { refNo, organisation }
}

// Examples for updateDataRows:
// [ { reprocessingType: 'input', regNumber: 'R25SR500030912PA', accNumber: 'ACC123456', status: 'approved' }]
export async function updateMigratedOrganisation(orgId, updateDataRows) {
  const authClient = new AuthClient()
  const baseAPI = new BaseAPI()

  let payload, urlSuffix
  if (process.env.ENVIRONMENT === 'test') {
    payload = new FormData()
    payload.append('client_id', config.auth.clientId)
    payload.append('client_secret', config.auth.clientSecret)
    payload.append('username', config.auth.username)
    payload.append('password', config.auth.password)
    payload.append('scope', config.auth.scope)
    payload.append('grant_type', config.auth.grantType)
    urlSuffix = ''
  } else {
    const clientId = 'clientId'
    const username = 'ea@test.gov.uk'
    payload = JSON.stringify({ clientId, username })
    urlSuffix = '/sign'
  }
  await authClient.generateToken(payload, urlSuffix)

  let response = await baseAPI.get(
    `/v1/organisations/${orgId}`,
    authClient.authHeader()
  )
  const responseData = await response.body.json()

  const currentYear = new Date().getFullYear()

  let data = responseData

  for (let i = 0; i < updateDataRows.length; i++) {
    const orgUpdateData = updateDataRows[i]
    data.registrations[i].status = orgUpdateData.status
    data.registrations[i].validFrom = '2025-01-01'
    data.registrations[i].validTo = `${currentYear + 1}-01-01`
    data.registrations[i].registrationNumber = orgUpdateData.regNumber
    data.registrations[i].accreditationId = data.accreditations[i].id
    data.accreditations[i].status = orgUpdateData.status
    data.accreditations[i].validFrom = '2025-01-01'
    data.accreditations[i].validTo = `${currentYear + 1}-01-01`
    if (orgUpdateData.validFrom?.trim()) {
      data.registrations[i].validFrom = orgUpdateData.validFrom
      data.accreditations[i].validFrom = orgUpdateData.validFrom
    }
    if (orgUpdateData.reprocessingType?.trim()) {
      data.registrations[i].reprocessingType = orgUpdateData.reprocessingType
      data.accreditations[i].reprocessingType = orgUpdateData.reprocessingType
    }
    if (orgUpdateData.glassRecyclingProcess?.trim()) {
      data.registrations[i].glassRecyclingProcess = [
        orgUpdateData.glassRecyclingProcess
      ]
      data.accreditations[i].glassRecyclingProcess = [
        orgUpdateData.glassRecyclingProcess
      ]
    }
    data.accreditations[i].accreditationNumber = orgUpdateData.accNumber
  }

  let email = ''
  if (updateDataRows[0].email) {
    email = updateDataRows[0].email
  } else {
    // Replace email address with a newly generated one in Environment to avoid same email address all the time
    email = process.env.ENVIRONMENT
      ? fakerEN_GB.internet.email()
      : data.submitterContactDetails.email
    data.submitterContactDetails.email = email
  }

  data.status = updateDataRows[0].status

  data = { organisation: data }

  response = await baseAPI.patch(
    `/v1/dev/organisations/${orgId}`,
    JSON.stringify(data)
  )
  expect(response.statusCode).toBe(200)

  return email
}

export async function createAndRegisterDefraIdUser(
  email,
  numberOfRelationships = 1
) {
  const defraIdStub = new DefraIdStub()
  const users = new Users()
  const user = await users.userPayload(email)
  await defraIdStub.register(JSON.stringify(user))

  for (let i = 0; i < numberOfRelationships; i++) {
    const params = await users.userParams(user.userId)
    const resp = await defraIdStub.addRelationship(
      params.toString(),
      user.userId
    )
    expect(resp.statusCode).toBe(302)
  }

  return user
}

export async function linkDefraIdUser(organisationId, userId, email) {
  const baseAPI = new BaseAPI()
  const defraIdStub = new DefraIdStub()
  const users = new Users()

  const payload = await users.authorisationPayload(email)
  const response = await defraIdStub.authorise(payload)
  const sessionId = response.split('sessionId=')[1]

  const tokenPayload = await users.tokenPayload(sessionId)
  await defraIdStub.generateToken(JSON.stringify(tokenPayload), userId)

  const linkResponse = await baseAPI.post(
    `/v1/organisations/${organisationId}/link`,
    '',
    defraIdStub.authHeader(userId)
  )

  expect(linkResponse.statusCode).toBe(200)
}
