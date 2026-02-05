const express = require('express')
const app = express()
app.disable('x-powered-by')
app.use(express.json())

function checkAuth(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Authorization required' })
    }

    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
    const [username, password] = credentials.split(':')

    // Validate credentials (change these to your test values)
    if (username === 'testuser' && password === 'testpassword') {
        req.user = username
        return next()
    }

    res.status(401).json({ error: 'Invalid credentials' })
}

app.get('/waste-organisations/organisations', checkAuth, (req, res) => {
    res.json({
      "organisations": [
        {
          "id": "20970aa3-b705-4d05-949b-c03feb41e1e1",
          "name": "COUNCIL FARM LIMITED",
          "tradingName": "Council Farm Trading",
          "businessCountry": "GB-ENG",
          "companiesHouseNumber": "73457667",
          "address": {
            "addressLine1": "1",
            "addressLine2": "Council Farm Six Mile Bottom Road",
            "town": "Cambridge",
            "county": null,
            "postcode": "CB21 5LD",
            "country": "England"
          },
          "registrations": [
            {
              "status": "REGISTERED",
              "type": "COMPLIANCE_SCHEME",
              "registrationYear": 2026
            }
          ]
        },
        {
          "id": "fcdee15c-6f14-41e8-9f4c-ce1288a72b8e",
          "name": "DLOWCAMP CIC",
          "tradingName": "Dlowcamp Trading",
          "businessCountry": "GB-ENG",
          "companiesHouseNumber": "45019220",
          "address": {
            "addressLine1": "7",
            "addressLine2": "Rosenthorpe Road",
            "town": "London",
            "county": null,
            "postcode": "SE15 3EG",
            "country": "England"
          },
          "registrations": [
            {
              "status": "REGISTERED",
              "type": "COMPLIANCE_SCHEME",
              "registrationYear": 2026
            }
          ]
        },
        {
          "id": "2a477323-6c7b-46c5-b141-3bf34ac5e030",
          "name": "ROCO DIGITAL LTD",
          "tradingName": "Roco Digital Limited",
          "businessCountry": "GB-ENG",
          "companiesHouseNumber": "94629328",
          "address": {
            "addressLine1": "TEST BUILDING",
            "addressLine2": "1 STREET NAME",
            "town": "Tester Town",
            "county": "Tester County",
            "postcode": "T1 1TT",
            "country": "United Kingdom"
          },
          "registrations": [
            {
              "status": "REGISTERED",
              "type": "COMPLIANCE_SCHEME",
              "registrationYear": 2026
            }
          ]
        }
      ]
    })
})

app.listen(3020, '0.0.0.0', () => {
    console.log('Mock API running on port 3020')
    console.log('Test with: curl -u testuser:testpassword http://localhost:3020/waste-organisations/organisations')
})
