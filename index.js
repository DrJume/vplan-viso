process.env.NODE_PATH = __dirname
require('module')._initPaths() // Might break in the future

const pathTools = require('path')

const promiseFs = require('helpers/promisified-fs')
const try_ = require('helpers/try-wrapper')
const logger = require('helpers/logger')

global.log = logger

const UploadWatcher = require('services/UploadWatcher')
const XmlParser = require('services/XmlParser')

UploadWatcher(async (day, filePath) => {
  log.info(`${day}: ${filePath}`, 'FILE_UPLOAD')

  if (pathTools.extname(filePath) !== '.xml') {
    log.info(filePath, 'NON_XML_FILE')
    return
  }

  await XmlParser.parse(filePath)

  let err // eslint-disable-next-line prefer-const
  [err] = await try_(
    promiseFs.unlink(filePath),
    { logLabel: 'FILE_DELETE_ERR' },
  )
})
