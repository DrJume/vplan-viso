process.env.NODE_PATH = __dirname
require('module')._initPaths() // Might break in the future

const logger = require('helpers/logger')

global.log = logger

const UploadWatcher = require('services/UploadWatcher')

UploadWatcher((day, filePath) => {
  log.info(`${day}: ${filePath}`)
})
