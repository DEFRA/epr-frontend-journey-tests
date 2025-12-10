#!/bin/sh

curl -X PATCH http://epr-backend:3001/v1/dev/organisations/6507f1f77bcf86cd79943911 \
  -H "Content-Type: application/json" \
  -d '{
        "organisation": {
          "registrations": [
            {
              "id": "6507f1f77bcf86cd79943912",
              "status": "approved",
              "validFrom": "2025-01-01T00:00:00.000Z",
              "validTo": "2028-01-01T00:00:00.000Z",
              "registrationNumber": "R25SR500030912PA"
            },
            {
              "id": "6507f1f77bcf86cd79943913",
              "status": "approved",
              "validFrom": "2025-01-01T00:00:00.000Z",
              "validTo": "2028-01-01T00:00:00.000Z",
              "registrationNumber": "R25SR500030913PA"
            }
          ],
          "accreditations": [
            {
              "id": "68f6a147c117aec8a1ab7497",
              "accreditationNumber": "ACC123456",
              "validFrom": "2025-01-01T00:00:00.000Z",
              "validTo": "2028-01-01T00:00:00.000Z",
              "status": "approved"
            }
          ]
        }
      }
'
