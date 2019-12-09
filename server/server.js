const readLastLines = require('read-last-lines')
const watch = require('node-watch')
// const express = require('express')
const fetch = require('node-fetch')

// const app = express()
// const port = process.env.PORT || 5000

const config = {
  FBFilename: 'webgl-gource-1da99-firebase-adminsdk-2gak7-c2e824de64.json',
  collection: 'shelley-node-log'
}

// firebase
const admin = require('firebase-admin')
const serviceAccount = require('./auth/' + config.FBFilename)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const firebaseDB = admin.firestore()

const filePath = '/home/scott/self-node/blocks.log'
const geoLocationURL = 'https://api.ipdata.co/'
const geoLocationConfig = require('./auth/ipdata.json')

// app.get('/test', (req, res) => {
watch(filePath, { recursive: true }, function (evt, name) {
  readLastLines.read(filePath, 1)
    .then(async (lines) => {
      try {
        const msg = JSON.parse(lines)
        if (typeof msg.peer_addr !== 'undefined') {
          let url = new URL('http://' + msg.peer_addr)
          url.port = ''

          const ipAddress = url.host

          // check if geodata is in db
          let docRef = firebaseDB.collection(config.collection).doc(ipAddress)
          let snapshot = await docRef.get()

          if (!snapshot.exists) {
          // get lat/long for ip
            fetch(geoLocationURL + url.host + '?api-key=' + geoLocationConfig.APIKey, {
              method: 'GET'
            })
              .then(res => res.text())
              .then((body) => {
                let geoData = JSON.parse(body)

                if (typeof geoData.latitude !== 'undefined') {
                // save geolocation in db
                  let saveData = {
                    ip: ipAddress,
                    lat: geoData.latitude,
                    long: geoData.longitude,
                    region: geoData.region,
                    country: geoData.country_name,
                    city: geoData.city,
                    timestamp: admin.firestore.Timestamp.fromDate(new Date())
                  }

                  docRef.set(saveData, { merge: true }).then(() => {
                    console.log('Geolocation data saved for IP: ' + ipAddress)
                  })
                } else {
                  let saveData = {
                    ip: ipAddress,
                    timestamp: admin.firestore.Timestamp.fromDate(new Date())
                  }

                  docRef.set(saveData, { merge: true }).then(() => {
                    console.log('Could not get geolocation data for: ' + ipAddress)
                  })
                }
              })
              .catch(error => console.error(error))
          } else {
          // just store updated time
            let saveData = {
              timestamp: admin.firestore.Timestamp.fromDate(new Date())
            }

            docRef.set(saveData, { merge: true }).then(() => {
              console.log('Updated node timestamp for IP: ' + ipAddress)
            })
          }
        }
      } catch (error) {
        console.log(error)
      }
    })
})

// res.send({ express: 'Check console' })
// })

// app.listen(port, () => console.log(`Listening on port ${port}`))
