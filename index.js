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
  log.debug(`${day}: ${filePath}`, 'FILE_APPEARED')

  if (pathTools.extname(filePath) !== '.xml') {
    // Don't delete parsed JSON Files
    if (pathTools.extname(filePath) === '.json') {
      log.info(filePath, 'JSON_FILE_FOUND')
      return
    }

    log.warn(filePath, 'NON_XML_FILE')

    log.warn(filePath, 'UNKOWN_FILETYPE_UPLOAD_DELETED')
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
