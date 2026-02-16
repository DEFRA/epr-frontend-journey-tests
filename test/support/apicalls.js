import {
  Accreditation,
  Organisation,
  Registration
} from '../support/generator.js'

import { fakerEN_GB } from '@faker-js/faker'
import { expect } from '@wdio/globals'
import { FormData } from 'undici'
import { EprBackend } from '../apis/epr-backend.js'
import config from '../config/config.js'
import { AuthClient } from './auth.js'
import { cognitoStub } from './cognito-auth-stub.js'
import { defraIdStub } from './defra-id-stub.js'
import { MATERIALS } from './materials.js'
import Users from './users.js'

async function assertSuccessResponse(response, context) {
  const body = await response.body.json()
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `${context}: expected 2xx but got ${response.statusCode}\n${JSON.stringify(body, null, 2)}`
    )
  }
  return body
}

async function assertSuccessResponseWithoutBody(response, context) {
  if (response.statusCode < 200 || response.statusCode >= 300) {
    const body = await response.body.json()
    throw new Error(
      `${context}: expected 2xx but got ${response.statusCode}\n${JSON.stringify(body, null, 2)}`
    )
  }
}

export async function createOrgWithAllWasteProcessingTypeAllMaterials() {
  const wasteProcessingTypes = [
    {
      wasteProcessingType: 'Reprocessor',
      street: 'reprocessor input street',
      type: 'input'
    },
    {
      wasteProcessingType: 'Reprocessor',
      street: 'reprocessor output street',
      type: 'output'
    },
    { wasteProcessingType: 'Exporter', street: 'exporter street', type: '' }
  ]
  const dataRows = []

  for (const wasteProcessingType of wasteProcessingTypes) {
    for (const material of MATERIALS) {
      const updateDataRow = {}
      updateDataRow.material = material.material
      updateDataRow.glassRecyclingProcess = material.glassRecyclingProcess
      updateDataRow.wasteProcessingType =
        wasteProcessingType.wasteProcessingType
      updateDataRow.street = wasteProcessingType.street
      dataRows.push(updateDataRow)
    }
  }

  const organisationDetails = await createLinkedOrganisation(dataRows)

  const updateDataRows = []
  for (let i = 0; i < wasteProcessingTypes.length; i++) {
    for (const material of MATERIALS) {
      let prefix = 'E'
      const updateDataRow = {}
      if (wasteProcessingTypes[i].type !== '') {
        updateDataRow.reprocessingType = wasteProcessingTypes[i].type
        prefix = 'R'
      }
      updateDataRow.regNumber = `${prefix}25SR5000${i}0912${material.suffix}`
      updateDataRow.accNumber = `${prefix}-ACC12${i}45${material.suffix}`
      updateDataRow.status = 'approved'
      updateDataRows.push(updateDataRow)
    }
  }

  updateDataRows[0].email = `sanity_${fakerEN_GB.internet.email()}`

  const userEmail = await updateMigratedOrganisation(
    organisationDetails.refNo,
    updateDataRows
  )
  return { organisationDetails, userEmail }
}

// Examples
// dataRows = [{ material: 'Paper or board (R3)', wasteProcessingType: 'Reprocessor'}, { material: 'Steel (R4)', wasteProcessingType: 'Exporter'}]
export async function createLinkedOrganisation(dataRows) {
  const eprBackend = new EprBackend()

  const organisation = new Organisation()
  let payload = ''
  if (dataRows[0].wasteProcessingType === 'Reprocessor') {
    payload = organisation.toNonRegisteredUKSoleTraderPayload()
  } else {
    payload = organisation.toPayload()
  }

  let response = await eprBackend.post(
    '/v1/apply/organisation',
    JSON.stringify(payload)
  )
  expect(response.statusCode).toBe(200)

  const orgResponseData = await response.body.json()

  const orgId = orgResponseData?.orgId
  const refNo = orgResponseData?.referenceNumber

  const regAddresses = []

  for (const dataRow of dataRows) {
    let material = 'Paper or board (R3)'
    const glassRecyclingProcess = dataRow.glassRecyclingProcess?.trim()
    if (dataRow.material !== '') {
      material = dataRow.material
    }
    let registration = new Registration(orgId, refNo)
    if (dataRow.street !== '') {
      registration = new Registration(orgId, refNo, dataRow.street)
    }
    payload =
      dataRow.wasteProcessingType === 'Reprocessor'
        ? registration.toAllMaterialsPayload(material, glassRecyclingProcess)
        : registration.toExporterPayload(material, glassRecyclingProcess)
    response = await eprBackend.post(
      '/v1/apply/registration',
      JSON.stringify(payload)
    )
    expect(response.statusCode).toBe(201)
    regAddresses.push(registration.address)

    if (!dataRow.withoutAccreditation) {
      const accreditation = new Accreditation(orgId, refNo)
      accreditation.postcode = registration.postcode
      payload =
        dataRow.wasteProcessingType === 'Reprocessor'
          ? accreditation.toReprocessorPayload(material, glassRecyclingProcess)
          : accreditation.toExporterPayload(material, glassRecyclingProcess)

      response = await eprBackend.post(
        '/v1/apply/accreditation',
        JSON.stringify(payload)
      )
      expect(response.statusCode).toBe(201)
    }
  }

  response = await eprBackend.post(
    `/v1/dev/form-submissions/${refNo}/migrate`,
    ''
  )
  expect(response.statusCode).toBe(200)

  return { refNo, organisation, regAddresses }
}

// Examples for updateDataRows:
// [ { reprocessingType: 'input', regNumber: 'R25SR500030912PA', accNumber: 'ACC123456', status: 'approved' }]
export async function updateMigratedOrganisation(
  orgId,
  updateDataRows,
  submittedToRegulator
) {
  const authClient = new AuthClient()
  const eprBackend = new EprBackend()

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

  const timeout = 5000
  const startTime = Date.now()

  let response
  // Poll for 5 seconds until organisation is available
  while (Date.now() - startTime < timeout) {
    response = await eprBackend.get(
      `/v1/organisations/${orgId}`,
      authClient.authHeader()
    )
    if (response.statusCode < 200 || response.statusCode >= 300) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } else {
      break
    }
  }

  const responseData = await assertSuccessResponse(
    response,
    `GET /v1/organisations/${orgId}`
  )

  const currentYear = new Date().getFullYear()

  let data = responseData
  let accreditationIndex = 0

  for (let i = 0; i < updateDataRows.length; i++) {
    const orgUpdateData = updateDataRows[i]
    data.registrations[i].status = orgUpdateData.status
    data.registrations[i].validFrom = '2026-01-01'
    data.registrations[i].validTo = `${currentYear + 1}-01-01`
    data.registrations[i].registrationNumber = orgUpdateData.regNumber
    if (orgUpdateData.validFrom?.trim()) {
      data.registrations[i].validFrom = orgUpdateData.validFrom
    }
    if (orgUpdateData.reprocessingType?.trim()) {
      data.registrations[i].reprocessingType = orgUpdateData.reprocessingType
    }
    if (orgUpdateData.glassRecyclingProcess?.trim()) {
      data.registrations[i].glassRecyclingProcess = [
        orgUpdateData.glassRecyclingProcess
      ]
    }
    if (submittedToRegulator) {
      data.registrations[i].submittedToRegulator = submittedToRegulator
    }

    if (!orgUpdateData.withoutAccreditation) {
      const j = accreditationIndex
      data.registrations[i].accreditationId = data.accreditations[j].id
      data.accreditations[j].status = orgUpdateData.status
      data.accreditations[j].validFrom = '2026-01-01'
      data.accreditations[j].validTo = `${currentYear + 1}-01-01`
      if (orgUpdateData.validFrom?.trim()) {
        data.accreditations[j].validFrom = orgUpdateData.validFrom
      }
      if (orgUpdateData.reprocessingType?.trim()) {
        data.accreditations[j].reprocessingType = orgUpdateData.reprocessingType
      }
      if (orgUpdateData.glassRecyclingProcess?.trim()) {
        data.accreditations[j].glassRecyclingProcess = [
          orgUpdateData.glassRecyclingProcess
        ]
      }
      data.accreditations[j].accreditationNumber = orgUpdateData.accNumber
      if (submittedToRegulator) {
        data.accreditations[j].submittedToRegulator = submittedToRegulator
      }
      accreditationIndex++
    }
  }

  if (submittedToRegulator) {
    data.submittedToRegulator = submittedToRegulator
  }

  let email = ''
  if (updateDataRows[0].email) {
    email = updateDataRows[0].email
  } else {
    // Replace email address with a newly generated one in Environment to avoid same email address all the time
    email = process.env.ENVIRONMENT
      ? fakerEN_GB.internet.email()
      : data.submitterContactDetails.email
  }
  data.submitterContactDetails.email = email

  data.status = updateDataRows[0].status

  data = { organisation: data }

  response = await eprBackend.patch(
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
  const users = new Users()
  const user = await users.userPayload(email)
  await defraIdStub.register(JSON.stringify(user))
  defraIdStub.userIds.push(user.userId)

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
  const eprBackend = new EprBackend()
  const users = new Users()

  const payload = await users.authorisationPayload(email)
  const response = await defraIdStub.authorise(payload)
  const sessionId = response.split('sessionId=')[1]

  const tokenPayload = await users.tokenPayload(sessionId)
  await defraIdStub.generateToken(JSON.stringify(tokenPayload), userId)

  const linkResponse = await eprBackend.post(
    `/v1/organisations/${organisationId}/link`,
    '',
    defraIdStub.authHeader(userId)
  )

  expect(linkResponse.statusCode).toBe(200)
}

//TODO: Add auth, and also factor in TEST environment
export async function externalAPIcancelPrn(prnDetails) {
  await cognitoStub.generateToken()

  const eprBackend = new EprBackend()
  const response = await eprBackend.post(
    `/v1/packaging-recycling-notes/${prnDetails.prnNumber}/reject`,
    JSON.stringify({ rejectedAt: new Date().toISOString() }),
    cognitoStub.authHeader()
  )

  await assertSuccessResponseWithoutBody(
    response,
    `POST /v1/packaging-recycling-notes/${prnDetails.prnNumber}/reject`
  )
  prnDetails.status = 'Awaiting cancellation'
}

export async function externalAPIacceptPrn(prnDetails) {
  await cognitoStub.generateToken()

  const eprBackend = new EprBackend()
  const response = await eprBackend.post(
    `/v1/packaging-recycling-notes/${prnDetails.prnNumber}/accept`,
    JSON.stringify({ acceptedAt: new Date().toISOString() }),
    cognitoStub.authHeader()
  )

  await assertSuccessResponseWithoutBody(
    response,
    `POST /v1/packaging-recycling-notes/${prnDetails.prnNumber}/accept`
  )
  prnDetails.status = 'Accepted'
}
