const fs = require('node:fs/promises')

const OIAnalytics = require('./north-oianalytics')

const { defaultConfig: config } = require('../../../tests/test-config')

// Mock fs
jest.mock('node:fs/promises')

// Mock OIBusEngine
const engine = {
  configService: { getConfig: () => ({ engineConfig: config.engine }) },
  cacheFolder: './cache',
  requestService: { httpSend: jest.fn() },
}

// Mock services
jest.mock('../../service/database.service')
jest.mock('../../service/logger/logger.service')
jest.mock('../../service/status.service')
jest.mock('../../service/certificate.service')
jest.mock('../../service/encryption.service', () => ({ getInstance: () => ({ decryptText: (password) => password }) }))
jest.mock('../../engine/cache/value-cache')
jest.mock('../../engine/cache/file-cache')

const nowDateString = '2020-02-02T02:02:02.222Z'
let configuration = null
let north = null

describe('NorthOIAnalytics', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
    jest.useFakeTimers().setSystemTime(new Date(nowDateString))

    configuration = {
      id: 'northId',
      name: 'oia',
      enabled: false,
      type: 'OIAnalytics',
      caching: {
        sendInterval: 1000,
        retryInterval: 5000,
        groupCount: 10000,
        maxSendCount: 10000,
        archive: {
          enabled: true,
          retentionDuration: 720,
        },
      },
      settings: {
        host: 'https://hostname',
        endpoint: '/api/optimistik/data/values/upload',
        authentication: {
          type: 'Basic',
          username: 'anyuser',
          password: 'anypass',
        },
      },
      proxy: '',
      subscribedTo: [],
    }
    north = new OIAnalytics(configuration, engine)
    await north.init()
  })

  it('should be properly initialized', () => {
    expect(north.canHandleValues).toBeTruthy()
    expect(north.canHandleFiles).toBeTruthy()
  })

  it('should properly handle values', async () => {
    const values = [
      {
        pointId: 'pointId',
        timestamp: nowDateString,
        data: { value: 666, quality: 'good' },
      },
    ]
    await north.handleValues(values)

    const expectedUrl = `${configuration.settings.host}/api/oianalytics/oibus/time-values?dataSourceId=${configuration.name}`
    const expectedAuthentication = configuration.settings.authentication
    const expectedBody = JSON.stringify(values.map((value) => ({
      pointId: value.pointId,
      timestamp: value.timestamp,
      data: value.data,
    })))
    const expectedHeaders = { 'Content-Type': 'application/json' }
    expect(engine.requestService.httpSend).toHaveBeenCalledWith(
      expectedUrl,
      'POST',
      expectedAuthentication,
      null,
      expectedBody,
      expectedHeaders,
    )
  })

  it('should properly handle files', async () => {
    const filePath = '/path/to/file/example.file'
    jest.spyOn(fs, 'stat').mockImplementation(() => ({ size: 1000 }))

    await north.handleFile(filePath)

    const expectedUrl = `${configuration.settings.host}/api/oianalytics/value-upload/file?dataSourceId=${configuration.name}`
    const expectedAuthentication = configuration.settings.authentication
    expect(engine.requestService.httpSend).toHaveBeenCalledWith(expectedUrl, 'POST', expectedAuthentication, null, filePath)
  })

  it('should not retry', () => {
    const error = { responseError: true, statusCode: 201 }
    const result = north.shouldRetry(error)

    expect(result).toBeFalsy()
  })

  it('should retry because of status code', () => {
    const error = { responseError: true, statusCode: 400 }
    const result = north.shouldRetry(error)

    expect(result).toBeTruthy()
  })

  it('should retry because of response error', () => {
    const error = { responseError: false }
    const result = north.shouldRetry(error)

    expect(result).toBeTruthy()
  })
})
