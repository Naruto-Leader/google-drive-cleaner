/* global jest */

'use strict'

const googleapis = jest.genMockFromModule('googleapis')

// auth
class JWT {
  constructor () {
    return {
      authorize (callback) {
        callback(null, {
          access_token: 'access_token',
          expiry_date: 999999,
          refresh_token: 'jwt-placeholder',
          token_type: 'Bearer'
        })
      }
    }
  }
}
googleapis.google.auth = { JWT: JWT }

// drive
const driveObject = {
  about: {},
  files: {}
}
driveObject.files = {
  list (_, callback) {
    if (_.q === '__failed_test__') {
      callback(new Error('files failed test'))
    }
    callback(null, { data: {
      kind: 'drive#fileList',
      incompleteSearch: false,
      files: [{
        kind: 'drive#file',
        id: 'test-id1',
        name: 'test-name1',
        mimeType: 'test-mimeType1'
      }, {
        kind: 'drive#file',
        id: 'test-id2',
        name: 'test-name2',
        mimeType: 'test-mimeType2'
      }]
    } })
  },

  delete (_, callback) {
    if (_.fileId === '__failed_test__') {
      callback(new Error('delete failed test'))
    }
    callback(null)
  }
}
driveObject.about = {
  get (_, callback) {
    callback(null, { data: {
      storageQuota: {
        limit: '10',
        usage: '4',
        usageInDrive: '3',
        usageInDriveTrash: '1'
      }
    } })
  }
}
googleapis.google.drive = () => driveObject

module.exports = googleapis
