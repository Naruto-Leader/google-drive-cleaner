'use strict'

const fs = require('fs')
const google = require('googleapis')
const drive = google.drive('v3')

class GoogleDriveCleaner {
  waitMilliseconds () {
    return 700
  }

  constructor (jsonPath) {
    const privatekey = JSON.parse(fs.readFileSync(jsonPath))
    this.jwtClient = new google.auth.JWT(
      privatekey.client_email,
      null,
      privatekey.private_key,
      ['https://www.googleapis.com/auth/drive']
    )
  }

  auth () {
    return new Promise((resolve, reject) => {
      this.jwtClient.authorize((err, tokens) => {
        if (err) reject(err)
        resolve(tokens)
      })
    })
  }

  about () {
    return new Promise((resolve, reject) => {
      drive.about.get({
        auth: this.jwtClient,
        fields: [
          'storageQuota'
          // Other fields
          // https://developers.google.com/drive/v3/reference/about#resource
        ]
      }, (err, response) => {
        if (err) reject(err)
        resolve(response)
      })
    })
  }

  filesList (params) {
    return new Promise((resolve, reject) => {
      drive.files.list({
        auth: this.jwtClient,
        orderBy: 'modifiedTime',
        q: params.query
      }, (err, response) => {
        if (err) reject(err)
        resolve(response)
      })
    })
  }

  filesDelete (file, timeout) {
    const milliseconds = (() => {
      if (timeout == null) return 0
      return parseInt(timeout)
    })()

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(`Delete: ${file.name}`)
        drive.files.delete({
          auth: this.jwtClient,
          fileId: file.id
        }, (err, response) => {
          if (err) reject(err)
          resolve(response)
        })
      }, milliseconds)
    })
  }

  bytesToSize (bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return 'n/a'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
    if (Number.isNaN(i)) return i
    if (i === 0) return `${bytes} ${sizes[i]}`
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  isDryRun (params) {
    if (params.dryrun == null) return true
    if (params.dryrun !== false) return true
    return false
  }

  storageQuota () {
    return this.about()
      .then(res => res.storageQuota)
  }

  storageSpaceUsage () {
    return Promise.resolve().then(() => {
      return this.auth()
    }).then(() => {
      return this.about()
    }).then(response => {
      const storageQuota = response.storageQuota
      return storageQuota.usage / storageQuota.limit
    })
  }

  clean (params) {
    return Promise.resolve().then(() => {
      return this.auth()
    }).then(() => {
      return this.filesList(params)
    }).then(response => {
      console.log(JSON.stringify(response.files, null, '  '))
      if (this.isDryRun(params)) {
        console.log('It was dryrun.')
        return 'dryrun done'
      }

      console.log('Start deleting the file.')
      return response.files.map(file => {
        return () => this.filesDelete(file, this.waitMilliseconds())
      }).reduce((prev, curr) => {
        return prev.then(curr)
      }, Promise.resolve())
    })
  }
}

module.exports = GoogleDriveCleaner
