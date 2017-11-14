'use strict'

const GoogleDriveCleaner = require('../google-drive-cleaner')

const path = require('path')
const jsonPath = path.join(__dirname, 'fixtures/auth.json')

/* global describe, test, expect, beforeEach */
describe('GoogleDriveCleaner', () => {
  let googleDriveCleaner = null

  beforeEach(() => {
    googleDriveCleaner = new GoogleDriveCleaner(jsonPath)
  })

  test('googleDriveCleaner is instanceOf GoogleDriveCleaner', () => {
    expect(googleDriveCleaner).toBeInstanceOf(GoogleDriveCleaner)
  })

  test('auth()', () => {
    return googleDriveCleaner.auth().then(tokens => {
      expect(tokens.access_token).toBe('access_token')
      expect(tokens.expiry_date).toBe(999999)
      expect(tokens.refresh_token).toBe('jwt-placeholder')
      expect(tokens.token_type).toBe('Bearer')
    })
  })

  test('about()', () => {
    return googleDriveCleaner.about().then((response) => {
      expect(response).toEqual({
        storageQuota: {
          limit: '10',
          usage: '4',
          usageInDrive: '3',
          usageInDriveTrash: '1'
        }
      })
    })
  })

  test('filesList()', () => {
    return googleDriveCleaner.filesList({query: ''}).then((response) => {
      expect(response).toEqual({
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
      })
    })
  })

  test('filesDelete()', () => {
    return googleDriveCleaner.filesDelete({id: 'id'}).then((response) => {
      expect(response).toBeUndefined(response)
    })
  })

  test('bytesToSize()', () => {
    const tests = [{
      expected: '10 Bytes',
      actual: 10
    }, {
      expected: '2.1 KB',
      actual: 1024 * 2.1
    }, {
      expected: '3.4 MB',
      actual: 1024 * 1024 * 3.4
    }, {
      expected: '5.6 GB',
      actual: 1024 * 1024 * 1024 * 5.6
    }, {
      expected: '10.3 TB',
      actual: 1024 * 1024 * 1024 * 1024 * 10.3
    }]
    tests.forEach(test => {
      expect(googleDriveCleaner.bytesToSize(test.actual)).toBe(test.expected)
    })
  })

  test('bytesToSize() returns NaN', () => {
    expect(googleDriveCleaner.bytesToSize('hoge')).toBeNaN()
  })

  test('isDryRun() === true', () => {
    const tests = [{
      params: {}
    }, {
      params: {dryrun: true}
    }, {
      params: {dryrun: 'true'}
    }, {
      params: {dryrun: 'false'}
    }, {
      params: {dryrun: 'piyo'}
    }]
    tests.forEach(test => {
      expect(googleDriveCleaner.isDryRun(test.params)).toBeTruthy()
    })
  })

  test('isDryRun() === false', () => {
    const tests = [{
      params: {dryrun: false}
    }]
    tests.forEach(test => {
      expect(googleDriveCleaner.isDryRun(test.params)).toBeFalsy()
    })
  })

  test('storageQuota()', () => {
    return googleDriveCleaner.storageQuota().then((response) => {
      expect(response).toEqual({
        limit: '10',
        usage: '4',
        usageInDrive: '3',
        usageInDriveTrash: '1'
      })
    })
  })

  test('storageSpaceUsage()', () => {
    return googleDriveCleaner.storageSpaceUsage().then((response) => {
      expect(response).toBe(0.4)
    })
  })

  test('clean() with dryrun is true', () => {
    return googleDriveCleaner.clean({id: 'id'}).then((response) => {
      expect(response).toBe('dryrun done')
    })
  })

  test('clean() with dryrun is false', () => {
    googleDriveCleaner.waitMilliseconds = () => 0
    return googleDriveCleaner.clean({id: 'id', dryrun: false}).then((response) => {
      expect(response).toBeUndefined()
    })
  })
})
