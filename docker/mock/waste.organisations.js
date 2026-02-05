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
          "id": "9eb099a7-bda0-456c-96ba-e0af3fdb9cde",
          "name": "Looney Tunes",
          "tradingName": "Acme Compliance Scheme",
          "address": {
            "addressLine1": "37th Place",
            "town": "Ashfield",
            "county": "Chicago",
            "postcode": "W1 L3Y"
          }
        },
        {
          "id": "dd793573-b218-47a7-be85-1c777ca0d0d8",
          "name": "Bigco Packaging Ltd",
          "address": {
            "addressLine1": "Zig Zag road",
            "addressLine2": "Box Hill",
            "town": "Tadworth",
            "postcode": "KT20 7LB"
          }
        },
        {
          "id": "b7b158e1-c72f-45d4-8868-5c6e14bc10af",
          "name": "Green Waste Solutions",
          "address": {
            "addressLine1": "1 Worlds End Lane",
            "town": "Green St Green",
            "postcode": "BR6 6AG",
            "country": "England"
          }
        }
      ]
    })
})

app.listen(3020, '0.0.0.0', () => {
    console.log('Mock API running on port 3020')
    console.log('Test with: curl -u testuser:testpassword http://localhost:3020/waste-organisations/organisations')
})
