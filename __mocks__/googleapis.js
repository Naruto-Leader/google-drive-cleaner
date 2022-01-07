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
  list (params, callback) {
    if (params.q === '__failed_test__') {
      return Promise.reject(new Error('files failed test'))
    }
    return Promise.resolve({
      data: {
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
      }
    })
  },

  delete (params) {
    if (params.fileId === '__failed_test__') {
      return Promise.reject(new Error('delete failed test'))
    }
    return Promise.resolve()
  }
}
driveObject.about = {
  get () {
    return Promise.resolve({
      data: {
        storageQuota: {
          limit: '10',
          usage: '4',
          usageInDrive: '3',
          usageInDriveTrash: '1'
        }
      }
    })
  }
}
googleapis.google.drive = () => driveObject

module.exports = googleapis
