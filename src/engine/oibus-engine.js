const os = require('node:os')

const timexe = require('timexe')
const humanizeDuration = require('humanize-duration')

const fs = require('node:fs/promises')
const BaseEngine = require('./base-engine')
const HealthSignal = require('./health-signal')

const CACHE_FOLDER = './cache/data-stream'

/**
 * At startup, handles initialization of configuration, North and South connectors.
 * @class OIBusEngine
 */
class OIBusEngine extends BaseEngine {
  /**
   * Constructor for OIBusEngine
   * Reads the config file and create the corresponding Object.
   * Checks for critical entries such as scanModes and connectors.
   * @constructor
   * @param {ConfigurationService} configService - The config service
   * @param {EncryptionService} encryptionService - The encryption service
   * @return {void}
   */
  constructor(configService, encryptionService) {
    super(configService, encryptionService, CACHE_FOLDER)

    // Will only contain South/North connectors enabled based on the config file
    this.activeSouths = []
    this.activeNorths = []
    this.scanLists = {}

    this.memoryStats = {}
    this.addValuesMessages = 0
    this.addValuesCount = 0
    this.addFileCount = 0

    // Variable initialized in initEngineServices
    this.jobs = null
    this.engineName = null
    this.bufferMax = null
    this.bufferTimeoutInterval = null
    this.cache = null
    this.liveStatusInterval = null
    this.safeMode = null
    this.healthSignal = null
  }

  /**
   * Method used to init async services (like logger when loki is used with Bearer token auth)
   * @param {Object} engineConfig - the config retrieved from the file
   * @param {String} loggerScope - the scope used for the logger
   * @returns {Promise<void>} - The result promise
   */
  async initEngineServices(engineConfig, loggerScope = 'OIBusEngine') {
    await super.initEngineServices(engineConfig, loggerScope)

    this.engineName = engineConfig.engineName

    this.logger.info(`Starting OIBusEngine: ${JSON.stringify(this.getOIBusInfo(), null, 4)}`)

    engineConfig.scanModes.forEach(({ scanMode }) => {
      // Initialize the scanLists with empty arrays
      this.scanLists[scanMode] = []
    })

    this.updateEngineStatusData()
    if (this.liveStatusInterval) {
      clearInterval(this.liveStatusInterval)
    }

    this.liveStatusInterval = setInterval(() => {
      this.updateEngineStatusData()
    }, 5000)
  }

  /**
   * Add new values from a South connector to the Engine.
   * The Engine will forward the values to the Cache.
   * @param {String} id - The South connector id
   * @param {Object[]} values - Array of values
   * @returns {Promise<void>} - The result promise
   */
  async addValues(id, values) {
    // When coming from an external source, the south won't be found.
    const southOrigin = this.activeSouths.find((south) => south.id === id)
    this.logger.trace(`Add ${values.length} values to cache from South "${southOrigin?.name || id}".`)
    if (values.length) {
      this.activeNorths.filter((north) => north.canHandleValues && north.isSubscribed(id))
        .forEach((north) => {
          north.cacheValues(id, values)
        })
    }
  }

  /**
   * Add a new file from a South connector to the Engine.
   * The Engine will forward the file to the Cache.
   * @param {String} southId - The South connector id
   * @param {String} filePath - The path to the file
   * @param {Boolean} preserveFiles - Whether to preserve the file at the original location
   * @returns {Promise<void>} - The result promise
   */
  async addFile(southId, filePath, preserveFiles) {
    // When coming from an external source, the south won't be found.
    const southOrigin = this.activeSouths.find((south) => south.id === southId)
    this.logger.trace(`Add file "${filePath}" to cache from South "${southOrigin?.name || southId}".`)

    try {
      // Do not resolve promise if one of the connector fails. Otherwise, if a file is removed after a North fails,
      // the file can be lost.
      await Promise.all(this.activeNorths.filter((north) => north.canHandleFiles && north.isSubscribed(southId))
        .map((north) => north.cacheFile(filePath)))

      if (!preserveFiles) {
        try {
          await fs.unlink(filePath)
        } catch (unlinkError) {
          this.logger.error(unlinkError)
        }
      }
    } catch (error) {
      this.logger.error(error)
    }
  }

  /**
   * Creates a new instance for every North and South connectors and initialize them.
   * Creates CronJobs based on the ScanModes and starts them.
   * @param {Boolean} safeMode - Whether to start in safe mode
   * @returns {Promise<void>} - The result promise
   */
  async start(safeMode = false) {
    const {
      southConfig,
      northConfig,
      engineConfig,
    } = this.configService.getConfig()

    // 1. Engine
    await this.initEngineServices(engineConfig)

    this.safeMode = safeMode || engineConfig.safeMode
    if (this.safeMode) {
      this.logger.warn('OIBus Engine is running in safe mode.')
      return
    }

    // 2. South connectors
    this.activeSouths = southConfig.filter(({ enabled }) => enabled)
      .map((southConfiguration) => {
        const south = this.createSouth(southConfiguration)
        if (south) {
          // Associate the scanMode to all corresponding South connectors so the engine will know which South to
          // activate when a scanMode has a tick.
          if (southConfiguration.scanMode) {
            if (!this.scanLists[southConfiguration.scanMode]) {
              this.logger.error(`South connector ${southConfiguration.name} has an unknown scan mode: ${southConfiguration.scanMode}`)
            } else if (!this.scanLists[southConfiguration.scanMode].includes(southConfiguration.id)) {
              // Add the South for this scan only if not already there
              this.scanLists[southConfiguration.scanMode].push(southConfiguration.id)
            }
          } else if (Array.isArray(southConfiguration.points)) {
            if (southConfiguration.points.length > 0) {
              southConfiguration.points.forEach((point) => {
                if (point.scanMode !== 'listen') {
                  if (!this.scanLists[point.scanMode]) {
                    this.logger.error(`Point: ${point.pointId} in South connector `
                        + `${southConfiguration.name} has an unknown scan mode: ${point.scanMode}`)
                  } else if (!this.scanLists[point.scanMode].includes(southConfiguration.id)) {
                    // Add the South for this scan only if not already there
                    this.scanLists[point.scanMode].push(southConfiguration.id)
                  }
                }
              })
            } else {
              this.logger.warn(`South "${southConfiguration.name}" has no point.`)
            }
          } else {
            this.logger.error(`South "${southConfiguration.name}" has no scan mode defined.`)
          }
        }
        return south
      })
    this.logger.debug(JSON.stringify(this.scanLists, null, ' '))
    // Allows init/connect failure of a connector to not block other connectors
    await Promise.allSettled(this.activeSouths.map((south) => {
      const initAndConnect = async () => {
        try {
          await south.init()
          await south.connect()
        } catch (error) {
          this.logger.error(error)
        }
      }
      return initAndConnect()
    }))

    // 3. North connectors
    this.activeNorths = northConfig.filter(({ enabled }) => enabled)
      .map((northConfiguration) => this.createNorth(northConfiguration))
    // Allows init/connect failure of a connector to not block other connectors
    await Promise.allSettled(this.activeNorths.map((north) => {
      const initAndConnect = async () => {
        try {
          await north.init()
          await north.connect()
        } catch (error) {
          this.logger.error(error)
        }
      }
      return initAndConnect()
    }))

    // 4. Start the timers for each scan modes
    this.jobs = engineConfig.scanModes
      .filter((scanMode) => scanMode !== 'listen')
      .map(({
        scanMode,
        cronTime,
      }) => {
        const job = timexe(cronTime, () => {
          // On each scan, activate each South connector
          this.scanLists[scanMode].forEach(async (id) => {
            const activeSouth = this.activeSouths.find((south) => south.id === id)
            if (activeSouth) {
              await activeSouth.onScan(scanMode)
            } else {
              this.logger.error(`The South connector ${id} has not been initialized.`)
            }
          })
        })
        if (job.result !== 'ok') {
          this.logger.error(`The scan mode "${scanMode}" could not start: ${job.error}`)
        }
        return job
      })

    // 5. Start HealthSignal
    this.healthSignal = new HealthSignal(this)
    this.healthSignal.start()

    this.logger.info('OIBus started.')
  }

  /**
   * Gracefully stop every timer, South and North connectors
   * @returns {Promise<void>} - The result promise
   */
  async stop() {
    if (this.liveStatusInterval) {
      clearInterval(this.liveStatusInterval)
    }

    if (this.safeMode) {
      return
    }

    // Stop HealthSignal
    if (this.healthSignal) {
      this.healthSignal.stop()
    }

    // Stop timers
    this.jobs.forEach((job) => {
      if (job.result === 'ok') {
        timexe.remove(job.id)
      }
    })
    this.jobs = []
    this.scanLists = {}

    // Stop South connectors
    await Promise.allSettled(this.activeSouths.map((south) => {
      this.logger.info(`Stopping South "${south.name}" (${south.id}).`)
      return south.disconnect()
    }))
    this.activeSouths = []

    // Stop North connectors
    await Promise.allSettled(this.activeNorths.map((north) => {
      this.logger.info(`Stopping North "${north.name}" (${north.id}).`)
      return north.disconnect()
    }))
    this.activeNorths = []

    this.logger.info(JSON.stringify(this.statusService.getStatus(), null, 2))

    // Stop the listener
    this.statusService.stop()
  }

  /**
   * Get memory usage information.
   * @returns {Object} - The memory usage information
   */
  getMemoryUsage() {
    const memoryUsage = process.memoryUsage()
    Object.entries(memoryUsage)
      .forEach(([key, value]) => {
        if (!Object.keys(this.memoryStats)
          .includes(key)) {
          this.memoryStats[key] = {
            min: value,
            current: value,
            max: value,
          }
        } else {
          this.memoryStats[key].min = (value < this.memoryStats[key].min) ? value : this.memoryStats[key].min
          this.memoryStats[key].current = value
          this.memoryStats[key].max = (value > this.memoryStats[key].max) ? value : this.memoryStats[key].max
        }
      })

    return Object.keys(this.memoryStats)
      .reduce((result, key) => {
        const min = Number(this.memoryStats[key].min / 1024 / 1024)
          .toFixed(2)
        const current = Number(this.memoryStats[key].current / 1024 / 1024)
          .toFixed(2)
        const max = Number(this.memoryStats[key].max / 1024 / 1024)
          .toFixed(2)
        result[key] = `${min} / ${current} / ${max} MB`
        return result
      }, {})
  }

  /**
   * Get status information.
   * @returns {Object} - The status information
   */
  getOIBusInfo() {
    return {
      version: this.version,
      currentDirectory: process.cwd(),
      executable: process.execPath,
      nodeVersion: process.version,
      processId: process.pid,
      hostname: os.hostname(),
      architecture: process.arch,
      osRelease: os.release(),
      osType: os.type(),
      copyright: `(c) Copyright 2019-${new Date().getFullYear()} Optimistik, all rights reserved.`,
    }
  }

  /**
   * Update engine status data to be displayed on the home screen
   * @returns {void}
   */
  updateEngineStatusData() {
    const processCpuUsage = process.cpuUsage()
    const processUptime = 1000 * 1000 * process.uptime()
    const cpuUsagePercentage = Number((100 * (processCpuUsage.user + processCpuUsage.system)) / processUptime)
      .toFixed(2)
    const freeMemory = Number(os.freemem() / 1024 / 1024 / 1024)
      .toFixed(2)
    const totalMemory = Number(os.totalmem() / 1024 / 1024 / 1024)
      .toFixed(2)
    const percentMemory = Number((freeMemory / totalMemory) * 100)
      .toFixed(2)
    const memoryUsage = this.getMemoryUsage()

    const northConnectorsStatus = {}
    this.activeNorths.forEach((activeNorthConnector) => {
      const northStatus = activeNorthConnector.statusService.getStatus()
      if (activeNorthConnector.canHandleValues) {
        northConnectorsStatus[`Number of values sent to North "${
          activeNorthConnector.name}"`] = northStatus['Number of values sent since OIBus has started']
      }
      if (activeNorthConnector.canHandleFiles) {
        northConnectorsStatus[`Number of files sent to North "${
          activeNorthConnector.name}"`] = northStatus['Number of files sent since OIBus has started']
      }
    })

    const southConnectorsStatus = {}
    this.activeSouths.forEach((activeSouthConnector) => {
      const southStatus = activeSouthConnector.statusService.getStatus()
      if (activeSouthConnector.handlesPoints) {
        southConnectorsStatus[`Number of values retrieved from South "${
          activeSouthConnector.name}"`] = southStatus['Number of values since OIBus has started']
      }
      if (activeSouthConnector.handlesFiles) {
        southConnectorsStatus[`Number of files retrieved from South "${
          activeSouthConnector.name}"`] = southStatus['Number of files since OIBus has started']
      }
    })

    this.statusService.updateStatusDataStream({
      'Up time': humanizeDuration(1000 * process.uptime(), { round: true }),
      'CPU usage': `${cpuUsagePercentage}%`,
      'OS free memory': `${freeMemory} GB / ${totalMemory} GB (${percentMemory} %)`,
      'RAM occupation (min / current / max)': memoryUsage.rss,
      'Total heap size (min / current / max)': memoryUsage.heapTotal,
      'Heap used (min / current / max)': memoryUsage.heapUsed,
      'External C++ V8 memory (min / current / max)': memoryUsage.external,
      'Array buffers memory (min / current / max)': memoryUsage.arrayBuffers,
      ...northConnectorsStatus,
      ...southConnectorsStatus,
    })
  }
}

module.exports = OIBusEngine
