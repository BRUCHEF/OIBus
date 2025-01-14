/**
 * Base class to manage HTTP POST method for JSON payloads and file body parts
 */
class BaseRequest {
  constructor(engine) {
    this.engine = engine
    this.logger = engine.logger
  }

  /**
   * Send implementation.
   *
   * If "headers" contains Content-Type "data" is sent as string in the body.
   * If "headers" doesn't contain Content-Type "data" is interpreted as a path and sent as a file.
   * @param {String} requestUrl - The URL to send the request to
   * @param {String} method - The request type
   * @param {Object} headers - The headers
   * @param {Object} proxy - Proxy to use
   * @param {String} data - The data to send
   * @param {Number} timeout - The request timeout
   * @return {Promise<void>} - The result promise
   */
  async sendImplementation(requestUrl, method, headers, proxy, data, timeout) {
    this.logger.warn('sendImplementation() should be surcharged'
    + `Function called with ${method} ${requestUrl} and headers "${JSON.stringify(headers)}", `
    + `proxy "${proxy}", data "${data}" and timeout ${timeout}.`)
  }

  /**
   * Send HTTP request.
   *
   * If "baseHeader" contains Content-Type "data" is sent as string in the body.
   * If "baseHeader" doesn't contain Content-Type "data" is interpreted as a path and sent as a file.
   * @param {String} requestUrl - The URL to send the request to
   * @param {String} method - The request type
   * @param {Object} authentication - Authentication info
   * @param {Object} proxy - Proxy to use
   * @param {String} data - The body or file to send
   * @param {Object} baseHeaders - Headers to send
   * @returns {void}
   */
  async httpSend(requestUrl, method, authentication, proxy, data, baseHeaders = {}) {
    const { engineConfig: { httpRequest } } = this.engine.configService.getConfig()

    this.logger.trace(`httpSend() to ${method} ${requestUrl} using ${httpRequest.stack} stack.`)

    // Generate authentication header
    const headers = baseHeaders
    if (authentication) {
      switch (authentication.type) {
        case 'Basic': {
          const decryptedPassword = await this.engine.encryptionService.decryptText(authentication.password)
          const basic = Buffer.from(`${authentication.username}:${decryptedPassword}`).toString('base64')
          headers.Authorization = `Basic ${basic}`
          break
        }
        case 'API Key': {
          headers[authentication.key] = await this.engine.encryptionService.decryptText(authentication.secretKey)
          break
        }
        case 'Bearer': {
          headers.Authorization = `Bearer ${await this.engine.encryptionService.decryptText(authentication.token)}`
          break
        }
        default:
          throw new Error(`Unrecognized authentication type: "${authentication.type}".`)
      }
    }

    const timeout = 1000 * httpRequest.timeout
    await this.sendImplementation(requestUrl, method, headers, proxy, data, timeout)

    this.logger.trace(`httpSend() to ${method} ${requestUrl} using ${httpRequest.stack} stack Ok`)
  }
}

module.exports = BaseRequest
