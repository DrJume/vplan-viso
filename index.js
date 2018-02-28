process.env.NODE_PATH = __dirname
require('module')._initPaths() // Might break in the future

// Start test-script, process exits after it
// require('test/test-script')

const logger = require('helpers/logger')

global.log = logger

log.info('VPLAN-VISO_INIT')

const pathTools = require('path')

const promiseFs = require('helpers/promisified-fs')
const try_ = require('helpers/try-wrapper')

const UploadWatcher = require('services/UploadWatcher')
const XmlParser = require('services/XmlParser')

UploadWatcher(async (day, filePath) => {
  log.debug('FILE_APPEARED', `${day}: ${filePath}`)

  if (pathTools.extname(filePath) !== '.xml') {
    // Don't delete parsed JSON Files
    if (pathTools.extname(filePath) === '.json') {
      log.info('JSON_FILE_FOUND', filePath)
      return
    }

    log.warn('NON_XML_FILE', filePath)

    log.warn('UNKNOWN_FILETYPE_UPLOAD_DELETED', filePath)
    await try_(
      promiseFs.unlink(filePath),
      { logLabel: 'FILE_DELETE_ERR' },
    )
    return
  }

  await XmlParser.parseToFile(filePath)

  let err // eslint-disable-next-line prefer-const
  [err] = await try_(
    promiseFs.unlink(filePath),
    { logLabel: 'FILE_DELETE_ERR' },
  )
})
