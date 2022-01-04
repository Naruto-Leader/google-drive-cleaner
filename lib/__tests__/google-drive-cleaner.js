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

  test('default value of waitMilliseconds()', () => {
    expect(googleDriveCleaner.waitMilliseconds()).toEqual(700)
  })

  test('about()', async () => {
    const about = await googleDriveCleaner.about()
    expect(about).toEqual({
      storageQuota: {
        limit: '10',
        usage: '4',
        usageInDrive: '3',
        usageInDriveTrash: '1'
      }
    })
  })

  test.skip('about() failed', () => {})

  test('filesList()', async () => {
    const files = await googleDriveCleaner.filesList({ query: '' })
    expect(files).toEqual({
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

  test('filesList() failed', async () => {
    const promise = googleDriveCleaner.filesList({ query: '__failed_test__' })
    await expect(promise).rejects.toThrow(new Error('files failed test'))
  })

  test('filesDelete()', async () => {
    const response = await googleDriveCleaner.filesDelete({ id: 'id' })
    expect(response).toBeUndefined()
  })

  test('filesDelete() failed', async () => {
    const promise = googleDriveCleaner.filesDelete({ id: '__failed_test__' })
    await expect(promise).rejects.toThrow(new Error('delete failed test'))
  })

  test('bytesToSize()', () => {
    const tests = [{
      expected: '0 Bytes',
      actual: 0
    }, {
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
    }, {
      expected: '0 Bytes',
      actual: '0' // string
    }, {
      expected: '10 Bytes',
      actual: '10' // string
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
      params: { dryrun: true }
    }, {
      params: { dryrun: 'true' }
    }, {
      params: { dryrun: 'false' }
    }, {
      params: { dryrun: 'piyo' }
    }]
    tests.forEach(test => {
      expect(googleDriveCleaner.isDryRun(test.params)).toBeTruthy()
    })
  })

  test('isDryRun() === false', () => {
    const tests = [{
      params: { dryrun: false }
    }]
    tests.forEach(test => {
      expect(googleDriveCleaner.isDryRun(test.params)).toBeFalsy()
    })
  })

  test('storageQuota()', async () => {
    const storageQuota = await googleDriveCleaner.storageQuota()
    expect(storageQuota).toEqual({
      limit: '10',
      usage: '4',
      usageInDrive: '3',
      usageInDriveTrash: '1'
    })
  })

  test('storageSpaceUsage()', async () => {
    const storageSpaceUsage = await googleDriveCleaner.storageSpaceUsage()
    expect(storageSpaceUsage).toBe(0.4)
  })

  test('clean() with dryrun is true', async () => {
    const res = await googleDriveCleaner.clean({ id: 'id' })
    expect(res).toBe('dryrun done')
  })

  test('clean() with dryrun is false', async () => {
    googleDriveCleaner.waitMilliseconds = () => 0
    const res = await googleDriveCleaner.clean({ id: 'id', dryrun: false })
    expect(res).toBeUndefined()
  })
})
