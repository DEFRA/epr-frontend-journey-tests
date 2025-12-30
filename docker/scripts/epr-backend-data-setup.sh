#!/bin/sh

curl -X PATCH http://epr-backend:3001/v1/dev/organisations/6507f1f77bcf86cd79943911 \
  -H "Content-Type: application/json" \
  -d '{
        "organisation": {
          "registrations": [
            {
              "id": "6507f1f77bcf86cd79943912",
              "status": "approved",
              "validFrom": "2025-01-01",
              "validTo": "2028-01-01",
              "registrationNumber": "R25SR500030912PA",
              "reprocessingType": "input"
            },
            {
              "id": "6507f1f77bcf86cd79943913",
              "accreditationId": "68f6a147c117aec8a1ab7498",
              "status": "approved",
              "validFrom": "2025-01-01",
              "validTo": "2028-01-01",
              "registrationNumber": "E25SR500030913PA"
            }
          ],
          "accreditations": [
            {
              "id": "68f6a147c117aec8a1ab7497",
              "accreditationNumber": "ACC123456",
              "validFrom": "2025-01-01",
              "validTo": "2028-01-01",
              "status": "approved",
              "reprocessingType": "input"
            },
            {
              "id": "68f6a147c117aec8a1ab7498",
              "accreditationNumber": "ACC234567",
              "validFrom": "2025-01-01",
              "validTo": "2028-01-01",
              "status": "approved"
            }
          ],
          "status": "approved"
        }
      }
'

curl -X PATCH http://epr-backend:3001/v1/dev/organisations/6507f1f77bcf86cd79943931 \
  -H "Content-Type: application/json" \
  -d '{
        "organisation": {
          "registrations": [
            {
              "id": "6507f1f77bcf86cd79943932",
              "status": "approved",
              "validFrom": "2025-01-01",
              "validTo": "2028-01-01",
              "registrationNumber": "R25SR500050912PA",
              "reprocessingType": "output"
            },
            {
              "id": "6507f1f77bcf86cd79943933",
              "status": "approved",
              "validFrom": "2025-01-01",
              "validTo": "2028-01-01",
              "registrationNumber": "E25SR500050913PA"
            }
          ],
          "accreditations": [
            {
              "id": "68f6a147c117aec8a1ab749a",
              "accreditationNumber": "ACC500591",
              "validFrom": "2025-01-01",
              "validTo": "2028-01-01",
              "status": "approved",
              "reprocessingType": "output"
            }
          ],
          "status": "approved"
        }
      }
'
