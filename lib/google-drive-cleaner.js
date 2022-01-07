'use strict'

const { readFileSync } = require('fs')
const { google } = require('googleapis')

class GoogleDriveCleaner {
  waitMilliseconds () {
    return 700
  }

  constructor (jsonPath) {
    const privatekey = JSON.parse(readFileSync(jsonPath))
    const jwtClient = new google.auth.JWT(
      privatekey.client_email,
      null,
      privatekey.private_key,
      ['https://www.googleapis.com/auth/drive']
    )

    this.drive = google.drive({
      version: 'v3',
      auth: jwtClient
    })
  }

  async about () {
    const response = await this.drive.about.get({
      fields: [
        'storageQuota'
        // Other fields
        // https://developers.google.com/drive/v3/reference/about#resource
      ]
    })
    return response.data
  }

  async filesList (params) {
    const response = await this.drive.files.list({
      orderBy: 'modifiedTime',
      q: params.query
    })
    return response.data
  }

  async filesDelete (file, timeout) {
    const milliseconds = (() => {
      if (timeout == null) return 0
      return parseInt(timeout)
    })()
    await new Promise((resolve) => setTimeout(resolve, milliseconds))
    console.log(`Delete: ${file.name}`)
    return this.drive.files.delete({ fileId: file.id })
  }

  bytesToSize (bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    bytes = Number(bytes)
    if (bytes === 0) return '0 Bytes'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
    if (Number.isNaN(i)) return i
    if (i === 0) return `${bytes} ${sizes[i]}`
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  isDryRun (params) {
    return params.dryrun !== false
  }

  async storageQuota () {
    const res = await this.about()
    return res.storageQuota
  }

  async storageSpaceUsage () {
    const storageQuota = await this.storageQuota()
    return storageQuota.usage / storageQuota.limit
  }

  async clean (params) {
    const data = await this.filesList(params)
    console.log(JSON.stringify(data.files, null, '  '))
    if (this.isDryRun(params)) {
      console.log('It was dryrun.')
      return 'dryrun done'
    }

    console.log('Start deleting the file.')
    for (const file of data.files) {
      await this.filesDelete(file, this.waitMilliseconds())
    }
  }
}

module.exports = GoogleDriveCleaner
