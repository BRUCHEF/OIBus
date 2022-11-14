const net = require('net')

const NorthConnector = require('../north-connector')
const DeferredPromise = require('../../service/deferred-promise')

class Taho extends NorthConnector {
  static category = 'IoT'

  /**
   * Constructor for Taho
   * @constructor
   * @param {Object} configuration - The North connector configuration
   * @param {BaseEngine} engine - The Engine
   * @return {void}
   */
  constructor(configuration, engine) {
    super(configuration, engine)
    const { host, port } = configuration.settings
    this.host = host
    this.port = port
    this.sentValues = {}
    this.canHandleValues = true
    this.canHandleFiles = false
    this.notificationCache = {}
  }

  /**
   * Handle messages by sending them to another OIBus
   * @param {object[]} values - The values
   * @return {Promise} - The handle status
   */

  async handleValues(values) {
    // Map each file to a promise and remove files sequentially
    // TODO: prepare notificationCache first, send the whole notificationCache after
    await values.filter((value) => this.sentValues[value.pointId] !== value.data.value)
      .reduce((promise, value) => promise.then(
        async () => this.sendValue(value),
      ), Promise.resolve())
  }

  async sendValue(value) {
    console.log('Boucle Value.forEach, point :', value.pointId)
    this.sentValues[value.pointId] = value.data.value
    console.log('1')
    console.log('Condition SentValue : ', value.pointId)

    if (this.notificationCache[value.pointId]) {
      this.notificationCache[value.pointId].valPrec = this.notificationCache[value.pointId].valEnCours
      this.notificationCache[value.pointId].valEnCours = String.fromCharCode(parseInt(value.data.value, 10))
    } else {
      this.notificationCache[value.pointId] = {
        Module: 'ADAM0x',
        NotifPanel: 'CHANGEMENTETAT',
        pointId: value.pointId,
        valPrec: '',
        valEnCours: String.fromCharCode(parseInt(value.data.value, 10)),
      }
    }
    await this.writeValueIntoSocket(this.notificationCache[value.pointId])
  }

  async writeValueIntoSocket(value) {
    const sLigne = `${value.Module}|${value.NotifPanel}|${value.pointId}|${value.valPrec}|${value.valEnCours}|ERR|ERR`
    console.log('sLigne:', sLigne)
    console.log('bcleexiste 4.3')
    this.pendingWrite$ = new DeferredPromise()
    this.socket.write(sLigne)
    await this.pendingWrite$.promise
    console.log('sLigne envoyé !')
    console.log('Apres 1.1 ')
  }

  /**
   * Connect to a remote TCP server.
   * @param {String} _additionalInfo - Connection information to display in the logger
   * @returns {Promise<void>} - The result promise
   */
  async connect(_additionalInfo = '') {
    this.connectToTCPServer(_additionalInfo)
  }

  /**
   * Disconnection from the TCP server
   * @returns {Promise<void>} - The result promise
   */
  async disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    if (this.connected) {
      this.socket.end()
      this.connected = false
    }
    await super.disconnect()
  }

  connectToTCPServer(_additionalInfo) {
    this.reconnectTimeout = null
    this.socket = new net.Socket()
    this.socket.connect(
      { host: this.host, port: this.port },
      async () => {
        await super.connect(_additionalInfo)
      },
    )
    this.socket.on('error', async (error) => {
      this.logger.error(`Taho connect error: ${JSON.stringify(error)}`)
      this.pendingWrite$.reject()
      await this.disconnect()
      this.reconnectTimeout = setTimeout(this.connectToTCPServer.bind(this), this.caching.retryInterval)
    })

    this.socket.on('data', (data) => {
      console.log('received from taho', data)
      // TODO: parse data
      this.pendingWrite$.resolve()
    })
  }
}

module.exports = Taho
