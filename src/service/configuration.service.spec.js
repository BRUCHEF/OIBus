const fs = require('node:fs/promises')
const path = require('node:path')

const ConfigurationService = require('./configuration.service')

jest.mock('node:fs/promises')

// Mock utils class
jest.mock('./utils')

jest.mock('./encryption.service', () => ({ getInstance: () => ({ encryptSecrets: (password) => password }) }))

let service = null
const nowDateString = '2020-02-02T02:02:02.222Z'
const configFilePath = './myConfigFilePath/oibus.json'
const cacheFolder = './myCacheFolder'

describe('Configuration service', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.useFakeTimers().setSystemTime(new Date(nowDateString))

    service = new ConfigurationService(configFilePath, cacheFolder)
  })

  it('should properly initialized service with default conf', async () => {
    const mockConf = {
      engine: 'myEngineConfig',
      north: [{ id: 'myNorthConfig' }],
      south: [{ id: 'mySouthConfig' }],
    }
    fs.readFile.mockImplementationOnce(() => {
      throw new Error('file does not exist')
    }).mockImplementationOnce(() => (JSON.stringify(mockConf)))

    service.activateConfiguration = jest.fn()
    await service.init()

    expect(fs.readFile).toHaveBeenCalledTimes(2)
    expect(fs.readFile).toHaveBeenCalledWith(path.resolve(configFilePath), 'utf8')
    expect(fs.readFile).toHaveBeenCalledWith(`${__dirname}/../config/default-config.json`, 'utf8')
    expect(fs.copyFile).not.toHaveBeenCalled()
    expect(service.activateConfiguration).not.toHaveBeenCalled()
    expect(service.config).toEqual(mockConf)
    expect(service.modifiedConfig).toEqual(mockConf)
  })

  it('should properly initialized service with config file', async () => {
    const mockConf = {
      engine: { engineName: 'myEngineConfig' },
      north: [{ id: 'myNorthConfig' }],
      south: [{ id: 'mySouthConfig' }],
    }
    fs.readFile.mockImplementationOnce(() => (JSON.stringify(mockConf)))

    service.activateConfiguration = jest.fn()
    service.encryptionService.encryptSecrets = jest.fn().mockImplementation((secrets) => {
      secrets.encryptedPassword = 'encryptedPassword'
    })
    await service.init()

    expect(fs.readFile).toHaveBeenCalledTimes(1)
    expect(fs.readFile).toHaveBeenCalledWith(path.resolve(configFilePath), 'utf8')
    expect(fs.copyFile).not.toHaveBeenCalled()
    expect(service.activateConfiguration).toHaveBeenCalledTimes(1)
    expect(service.modifiedConfig).toEqual({
      engine: { engineName: 'myEngineConfig', encryptedPassword: 'encryptedPassword' },
      north: [{ id: 'myNorthConfig', encryptedPassword: 'encryptedPassword' }],
      south: [{ id: 'mySouthConfig', encryptedPassword: 'encryptedPassword' }],
    })
  })

  it('should get engine, south and north config', () => {
    const mockConf = {
      engine: { engineName: 'myEngineConfig' },
      north: [{ id: 'myNorthConfig' }],
      south: [{ id: 'mySouthConfig' }],
    }
    service.config = mockConf

    const result = service.getConfig()

    expect(result).toEqual({
      engineConfig: mockConf.engine,
      southConfig: mockConf.south,
      northConfig: mockConf.north,
    })
  })

  it('should get active config', () => {
    const mockConf = {
      engine: { engineName: 'myEngineConfig' },
      north: [{ id: 'myNorthConfig' }],
      south: [{ id: 'mySouthConfig' }],
    }
    service.config = mockConf

    const result = service.getActiveConfiguration()

    expect(result).toEqual(mockConf)
  })

  it('should activate modified config with backup', async () => {
    const mockConf = {
      engine: { engineName: 'myEngineConfig' },
      north: [{ id: 'myNorthConfig' }],
      south: [{ id: 'mySouthConfig' }],
    }
    service.modifiedConfig = mockConf

    await service.activateConfiguration()
    expect(fs.copyFile).toHaveBeenCalledWith(
      path.resolve(configFilePath),
      path.resolve('./myConfigFilePath/oibus-1580608922222.json'),
    )
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.resolve(configFilePath),
      JSON.stringify(mockConf, null, 4),
      'utf8',
    )
  })

  it('should activate modified config without backup', async () => {
    const mockConf = {
      engine: { engineName: 'myEngineConfig' },
      north: [{ id: 'myNorthConfig' }],
      south: [{ id: 'mySouthConfig' }],
    }
    service.modifiedConfig = mockConf

    await service.activateConfiguration(false)
    expect(fs.copyFile).not.toHaveBeenCalled()
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.resolve(configFilePath),
      JSON.stringify(mockConf, null, 4),
      'utf8',
    )
  })
})
