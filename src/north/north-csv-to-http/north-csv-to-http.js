const { createReadStream } = require('node:fs')

const csv = require('papaparse')

const NorthConnector = require('../north-connector')
const { convertCSVRowIntoHttpBody, isHeaderValid } = require('./utils')

const ERROR_PRINT_SIZE = 5

/**
 * Class NorthCsvToHttp - convert a CSV file into JSON payload for HTTP requests (POST/PUT/PATCH)
 */
class NorthCsvToHttp extends NorthConnector {
  static category = 'API'

  /**
   * Constructor for NorthCsvToHttp
   * @constructor
   * @param {Object} configuration - The North connector configuration
   * @param {BaseEngine} engine - The Engine
   * @return {void}
   */
  constructor(configuration, engine) {
    super(configuration, engine)
    this.canHandleFiles = true

    const {
      applicativeHostUrl,
      requestMethod,
      bodyMaxLength,
      acceptUnconvertedRows,
      authentication,
      csvDelimiter,
      mapping,
      proxy,
    } = configuration.settings

    // Creation of an entity request with is composed of all necessaries information
    this.request = {
      host: applicativeHostUrl,
      method: requestMethod,
      authenticationField: authentication,
    }

    this.bodyMaxLength = bodyMaxLength
    this.acceptUnconvertedRows = acceptUnconvertedRows
    this.mapping = mapping || {}
    this.csvDelimiter = csvDelimiter
    this.proxy = this.getProxy(proxy)
  }

  /**
   * Send the file.
   * @param {String} filePath - The path of the file
   * @returns {Promise<void>} - The result promise
   */
  async handleFile(filePath) {
    // Verify that the received file is a CSV one
    const regexExp = /.csv$/

    if (!regexExp.test(filePath)) {
      throw new Error(`Invalid file format: .csv file expected. File "${filePath}" skipped.`)
    }

    const csvDataParsed = await this.parseCsvFile(filePath)

    if (csvDataParsed.length === 0) {
      this.logger.debug(`The file "${filePath}" is empty. Skipping it.`)
      return
    }

    // The CSV parsing is a success, so we begin to map the content
    // Initialize the body to an empty array
    const { httpBody, conversionErrorBuffer } = this.convertToHttpBody(csvDataParsed)

    if (httpBody.length !== 0) {
      try {
        await this.sendData(httpBody)
      } catch (error) {
        throw new Error(`Error while sending the data of file "${filePath} (skipping it)": ${error}.`)
      }
    }
    // Logs all the errors
    if (conversionErrorBuffer.length > 0) {
      this.logger.error(`${conversionErrorBuffer.length} conversion errors.`)

      if (conversionErrorBuffer.length > ERROR_PRINT_SIZE) {
        for (let i = 0; i < ERROR_PRINT_SIZE; i += 1) {
          this.logger.trace(`${conversionErrorBuffer[i]}`)
        }
      } else {
        conversionErrorBuffer.forEach((error) => {
          this.logger.trace(`${error}`)
        })
      }
    }
  }

  /**
   * @param {String} filePath - Path of the file to parse
   * @return {Promise<Object>} - The parsed content of the file
   */
  parseCsvFile(filePath) {
    return new Promise((resolve, reject) => {
      // Initialize array which will be filled at each step
      const csvDataParsed = []
      const csvFile = createReadStream(filePath)

      // Parse the CSV file into a JSON object
      csv.parse(csvFile, {
        delimiter: this.csvDelimiter,
        header: true,
        dynamicTyping: true,
        error: (error) => {
          this.logger.error(error)
          reject()
        },
        step: (step) => {
          csvDataParsed.push(step.data)
        },
        complete: () => {
          this.logger.debug(`File ${filePath} parsed.`)
          resolve(csvDataParsed)
        },
      })
    })
  }

  /**
   * @param {Object} csvFileInJson - JSON object of the CSV file
   * @return {Object} - The HTTP body and associated errors
   */
  convertToHttpBody(csvFileInJson) {
    const httpBody = []
    // Reset the buffer for error
    const conversionErrorBuffer = []

    // Log all headers in the CSV file and log the value ine the mapping not present in headers
    this.logger.trace(`All available headers are: ${Object.keys(csvFileInJson[0])}`)

    const onlyValidMappingValue = this.getOnlyValidMappingValue(csvFileInJson[0])

    // Start the mapping for each row
    csvFileInJson.forEach((csvRowInJson, index) => {
      const { value, error } = convertCSVRowIntoHttpBody(csvRowInJson, onlyValidMappingValue)

      // Test the result of the mapping/conversion before add it in the httpBody
      // Add if we accept error conversion or if everything is fine
      if ((!error && value) || (error && value && this.acceptUnconvertedRows)) {
        httpBody.push(value)
      }

      // Add all the errors caught into the buffer
      if (error) {
        error.forEach((err) => {
          conversionErrorBuffer.push(`Line ${index + 1} in CSV file: ${err}`)
        })
      }
    })
    return { httpBody, conversionErrorBuffer }
  }

  /**
   * Get only the valid mapping fields
   * @param {Object} allHeaders - Available headers in the CSV file
   * @return {Object[]} - Return a list of available headers
   */
  getOnlyValidMappingValue(allHeaders) {
    const onlyValidMappingValue = []
    this.mapping.forEach((mapping) => {
      if (!isHeaderValid(allHeaders, mapping.csvField)) {
        this.logger.warn(`The header: '${mapping.csvField}' is not present in the CSV file`)
      } else {
        onlyValidMappingValue.push(mapping)
      }
    })
    return onlyValidMappingValue
  }

  /**
   * @param {String[]} httpBody - Body to send
   * @returns {Promise<void>} - The result promise
   */
  async sendData(httpBody) {
    if (httpBody.length > this.bodyMaxLength) {
      // Divide the current body in array of maximum maxLength elements
      let i = 0
      const requests = []
      for (i; i < httpBody.length; i += this.bodyMaxLength) {
        requests.push(
          this.engine.requestService.httpSend(
            this.request.host,
            this.request.method,
            this.request.authenticationField,
            this.proxy,
            JSON.stringify(httpBody.slice(i, i + this.bodyMaxLength - 1)),
            { 'Content-Type': 'application/json' },
          ),
        )
      }
      await Promise.all(requests)
    } else {
      await this.engine.requestService.httpSend(
        this.request.host,
        this.request.method,
        this.request.authenticationField,
        this.proxy,
        JSON.stringify(httpBody),
        { 'Content-Type': 'application/json' },
      )
    }
  }
}

module.exports = NorthCsvToHttp
