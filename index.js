process.env.NODE_PATH = __dirname
require('module')._initPaths() // Might break in the future

const logger = require('helpers/logger') // eslint-disable-line import/no-unresolved

global.log = logger

const UploadWatcher = require('services/UploadWatcher') // eslint-disable-line import/no-unresolved

UploadWatcher((day = 'unknown', filename) => {
  if (day === 'unknown') {
    return
  }

  log.info(`${day}: ${filename}`)
})
