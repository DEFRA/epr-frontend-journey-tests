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
        },
        {
          "id": "7115ae56-9775-4578-bbd5-6e1ec41d892f",
          "name": "ARSLAN ALI GROUP LTD",
          "tradingName": "Arslan Ali Group Limited",
          "businessCountry": "GB-ENG",
          "companiesHouseNumber": "59050222",
          "address": {
            "addressLine1": "58a",
            "addressLine2": "Tudor Road",
            "town": "Hayes",
            "county": null,
            "postcode": "UB3 2QD",
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
          "id": "c4622525-9f73-4036-baf7-140fd151841e",
          "name": "RENTALS ESTATE LTD",
          "tradingName": "Rentals Estate Limited",
          "businessCountry": "GB-ENG",
          "companiesHouseNumber": "14688087",
          "address": {
            "addressLine1": "479",
            "addressLine2": "High Road",
            "town": "London",
            "county": null,
            "postcode": "N22 8JD",
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
          "id": "6ba78514-6f1e-40fb-99d2-54dbd0b392f4",
          "name": "MEDIA ROOMS LTD",
          "tradingName": "Media Rooms Limited",
          "businessCountry": "GB-ENG",
          "companiesHouseNumber": "25600399",
          "address": {
            "addressLine1": "Richmond House",
            "addressLine2": "Hill Street",
            "town": "Ashton",
            "county": "Lancashire",
            "postcode": "OL7 0PZ",
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
          "id": "6dc555e6-1113-448a-a34d-660f4a1e6dcc",
          "name": "HAQQAI LTD",
          "tradingName": "Haqqai Limited",
          "businessCountry": "GB-ENG",
          "companiesHouseNumber": "50362614",
          "address": {
            "addressLine1": "82a",
            "addressLine2": "James Carter Road",
            "town": "Bury St. Edmunds",
            "county": null,
            "postcode": "IP28 7DE",
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
          "id": "17d77872-b61b-463b-824a-12eaa4cf1d20",
          "name": "RR ENGINEERING WORKS LTD",
          "tradingName": "Rr Engineering Works Limited",
          "businessCountry": "GB-ENG",
          "companiesHouseNumber": "96977586",
          "address": {
            "addressLine1": "6",
            "addressLine2": "Monks Road",
            "town": "Coventry",
            "county": null,
            "postcode": "CV1 2BY",
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
          "id": "e6450e61-6d72-42ee-a493-18a1c9b8e7b4",
          "name": "U ASK UK LIMITED",
          "tradingName": "U Ask Uk Trading",
          "businessCountry": "GB-ENG",
          "companiesHouseNumber": "88701530",
          "address": {
            "addressLine1": "44",
            "addressLine2": "Ivanhoe Street",
            "town": "Bolton",
            "county": null,
            "postcode": "BL3 2PS",
            "country": "England"
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
