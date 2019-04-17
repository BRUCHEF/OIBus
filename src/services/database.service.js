const sqlite = require('sqlite')

const CACHE_TABLE_NAME = 'cache'

/**
 * Initiate SQLite3 database and create the cache table.
 * @param {string} databasePath - The database file path
 * @return {Sqlite.Database} - The SQLite3 database
 */
const createValuesDatabase = async (databasePath) => {
  const database = await sqlite.open(databasePath)
  const query = `CREATE TABLE IF NOT EXISTS ${CACHE_TABLE_NAME} (
                   id INTEGER PRIMARY KEY,
                   timestamp INTEGER,
                   data TEXT,
                   point_id TEXT
                 );`
  const stmt = await database.prepare(query)
  await stmt.run()

  return database
}

/**
 * Initiate SQLite3 database and create the cache table.
 * @param {string} databasePath - The database file path
 * @return {BetterSqlite3.Database} - The SQLite3 database
 */
const createFilesDatabase = async (databasePath) => {
  const database = await sqlite.open(databasePath)

  const query = `CREATE TABLE IF NOT EXISTS ${CACHE_TABLE_NAME} (
                   id INTEGER PRIMARY KEY,
                   timestamp INTEGER,
                   application TEXT,
                   path TEXT
                 );`
  const stmt = await database.prepare(query)
  await stmt.run()

  return database
}

/**
 * Initiate SQLite3 database and create the cache table.
 * @param {string} databasePath - The database file path
 * @return {BetterSqlite3.Database} - The SQLite3 database
 */
const createRawFilesDatabase = async (databasePath) => {
  const database = await sqlite.open(databasePath)

  const query = `CREATE TABLE IF NOT EXISTS ${CACHE_TABLE_NAME} (
                   id INTEGER PRIMARY KEY,
                   filename TEXT UNIQUE,
                   modified INTEGER
                 );`
  const stmt = await database.prepare(query)
  await stmt.run()

  return database
}

/**
 * Save value in database.
 * @param {BetterSqlite3.Database} database - The database to use
 * @param {object} value - The value to save
 * @return {void}
 */
const saveValue = async (database, value) => {
  const query = `INSERT INTO ${CACHE_TABLE_NAME} (timestamp, data, point_id) 
                 VALUES (?, ?, ?)`
  const stmt = await database.prepare(query)
  await stmt.run(value.timestamp, encodeURI(value.data), value.pointId)
}

/**
 * Get values count.
 * @param {BetterSqlite3.Database} database - The database to use
 * @return {number} - The values count
 */
const getValuesCount = async (database) => {
  const query = `SELECT COUNT(*) AS count
                 FROM ${CACHE_TABLE_NAME}`
  const stmt = await database.prepare(query)
  const result = await stmt.get()

  return result.count
}

/**
 * Get values to send to a given North application.
 * @param {BetterSqlite3.Database} database - The database to use
 * @param {string} count - The number of values to get
 * @return {array|null} - The values
 */
const getValuesToSend = async (database, count) => {
  const query = `SELECT id, timestamp, data, point_id AS pointId 
                 FROM ${CACHE_TABLE_NAME}
                 ORDER BY timestamp
                 LIMIT ${count}`
  const stmt = await database.prepare(query)
  const results = await stmt.all()

  let values = null

  if (results.length > 0) {
    values = results.map((value) => {
      value.data = decodeURI(value.data)
      return value
    })
  }

  return values
}

/**
 * Remove sent values from the cache for a given North application.
 * @param {BetterSqlite3.Database} database - The database to use
 * @param {Object} values - The values to remove
 * @return {void}
 */
const removeSentValues = async (database, values) => {
  const ids = values.map(value => value.id).join()
  const query = `DELETE FROM ${CACHE_TABLE_NAME}
                 WHERE id IN (${ids})`
  const stmt = await database.prepare(query)
  await stmt.run()
}

/**
 * Save file for a given application.
 * @param {BetterSqlite3.Database} database - The database to use
 * @param {number} timestamp - The timestamp
 * @param {string} applicationId - The application ID
 * @param {string} filePath - The file path
 * @return {void}
 */
const saveFile = async (database, timestamp, applicationId, filePath) => {
  const query = `INSERT INTO ${CACHE_TABLE_NAME} (timestamp, application, path) 
                 VALUES (?, ?, ?)`
  const stmt = await database.prepare(query)
  await stmt.run(timestamp, applicationId, filePath)
}

/**
 * Get file to send to a given North application.
 * @param {BetterSqlite3.Database} database - The database to use
 * @param {string} applicationId - The application ID
 * @return {string|null} - The file path
 */
const getFileToSend = async (database, applicationId) => {
  const query = `SELECT path 
                 FROM ${CACHE_TABLE_NAME}
                 WHERE application = ?
                 ORDER BY timestamp
                 LIMIT 1`
  const stmt = await database.prepare(query)
  const results = await stmt.all(applicationId)

  return results.length > 0 ? results[0].path : null
}

/**
 * Delete sent file from the cache for a given North application.
 * @param {BetterSqlite3.Database} database - The database to use
 * @param {string} applicationId - The application ID
 * @param {string} filePath - The file path
 * @return {void}
 */
const deleteSentFile = async (database, applicationId, filePath) => {
  const query = `DELETE FROM ${CACHE_TABLE_NAME}
                 WHERE application = ?
                   AND path = ?`
  const stmt = await database.prepare(query)
  await stmt.run(applicationId, filePath)
}

/**
 * Get file count.
 * @param {BetterSqlite3.Database} database - The database to use
 * @param {string} filePath - The file path
 * @return {number} - The file count
 */
const getFileCount = async (database, filePath) => {
  const query = `SELECT COUNT(*) AS count 
                 FROM ${CACHE_TABLE_NAME}
                 WHERE path = ?`
  const stmt = await database.prepare(query)
  const result = await stmt.get(filePath)

  return result.count
}

/**
 * Upsert handled raw file.
 * @param {BetterSqlite3.Database} database - The database to use
 * @param {string} filename - The filename
 * @param {number} modified - The modify time
 * @return {void}
 */
const upsertRawFile = async (database, filename, modified) => {
  const query = `INSERT INTO ${CACHE_TABLE_NAME} (filename, modified) 
                 VALUES (?, ?)
                 ON CONFLICT(filename) DO UPDATE SET modified = ?`
  const stmt = await database.prepare(query)
  await stmt.run(filename, modified, modified)
}

/**
 * Get modify time for handled raw file.
 * @param {BetterSqlite3.Database} database - The database to use
 * @param {string} filename - The filename
 * @return {string|null} - The modify time
 */
const getRawFileModifyTime = async (database, filename) => {
  const query = `SELECT modified 
                 FROM ${CACHE_TABLE_NAME}
                 WHERE filename = ?`
  const stmt = await database.prepare(query)
  const results = await stmt.all(filename)

  return results.length > 0 ? results[0].modified : null
}

module.exports = {
  createValuesDatabase,
  createFilesDatabase,
  createRawFilesDatabase,
  saveValue,
  getValuesCount,
  getValuesToSend,
  removeSentValues,
  saveFile,
  getFileToSend,
  deleteSentFile,
  getFileCount,
  upsertRawFile,
  getRawFileModifyTime,
}