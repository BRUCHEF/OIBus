const mqtt = require('mqtt')

const NorthConnector = require('../north-connector')

const { initMQTTTopic, recursiveSplitMessages } = require('./utils')

/**
 * Class NorthWATSY - Send MQTT messages for WATSY application
 * The MQTT message sent will have the format:
 * {
      'timestamp' : $timestamp in ns
      'tags'    : {
          'tag1'  : $tag_value_1
          'tag2'  : $tag_value_2
          ...
      }
      'fields'    : {
          'field1'  : $field_value_1
          'field2'  : $field_value_2
          ...
      }
      'host'      : $host (can't be null)
      'token'     : $token (can't be null)
  }
 */
class NorthWATSY extends NorthConnector {
  static category = 'API'

  /**
   * Constructor for NorthWATSY
   * @constructor
   * @param {Object} configuration - The North connector configuration
   * @param {BaseEngine} engine - The Engine
   * @return {void}
   */
  constructor(configuration, engine) {
    super(configuration, engine)
    this.canHandleValues = true

    const {
      MQTTUrl,
      port,
      username,
      password,
      applicativeHostUrl,
      secretKey,
    } = configuration.settings
    this.url = MQTTUrl
    this.port = port
    this.username = username
    this.password = password
    this.qos = 1
    this.host = applicativeHostUrl
    this.secretKey = secretKey

    this.splitMessageTimeout = configuration.caching.sendInterval // in ms
    this.mqttTopic = initMQTTTopic(engine.engineName, this.host)

    // Initialized at connection
    this.client = null
  }

  /**
   * Connection to a MQTT broker
   * @param {String} _additionalInfo - Connection information to display in the logger
   * @returns {Promise<void>} - The result promise
   */
  async connect(_additionalInfo = '') {
    this.logger.info(`Connecting North "${this.name}" to "${this.url}".`)

    const options = {
      username: this.username,
      password: this.password ? Buffer.from(await this.encryptionService.decryptText(this.password)) : '',
      port: this.port,
    }
    this.client = mqtt.connect(this.url, options)

    this.client.on('connect', async () => {
      await super.connect(`url: ${this.url}`)
    })

    this.client.on('error', (error) => {
      this.logger.error(error)
    })
  }

  /**
   * Disconnection from MQTT Broker
   * @returns {Promise<void>} - The result promise
   */
  async disconnect() {
    this.logger.info(`Disconnecting North "${this.name}" from "${this.url}".`)
    this.client.end(true)
    await super.disconnect()
  }

  /**
   * Handle messages by sending them to WATSYConnect North.
   * @param {Object[]} values - The messages
   * @returns {Promise<void>} - The result promise
   */
  async handleValues(values) {
    this.logger.trace(`Handle ${values.length} values.`)

    if (values.length > 0) {
      const watsyMessages = recursiveSplitMessages(
        [],
        values,
        this.host,
        await this.encryptionService.decryptText(this.secretKey),
        this.splitMessageTimeout,
      )
      await Promise.all(watsyMessages.map((message) => this.publishValue(message)))
    }
  }

  /**
   * Publish MQTT message.
   * @param {Object} value - The value to publish
   * @returns {Promise<void>} - The result promise
   */
  publishValue(value) {
    return new Promise((resolve, reject) => {
      this.client.publish(
        this.mqttTopic,
        JSON.stringify(value),
        { qos: this.qos },
        (error) => {
          if (error) {
            reject(error)
          } else {
            resolve()
          }
        },
      )
    })
  }
}

module.exports = NorthWATSY
