const path = require('path')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified-fs')

const UploadWatcher = require('services/UploadWatcher')
const XmlParser = require('services/XmlParser')

function RunVplanReceiver() {
  UploadWatcher(async (day, filePath) => {
    log.debug('FILE_APPEARED', `${day}: ${filePath}`)

    if (path.extname(filePath) !== '.xml') {
      // Don't delete parsed JSON Files
      if (path.extname(filePath) === '.json') {
        log.info('JSON_FILE_FOUND', filePath)
        return
      }

      log.warn('NON_XML_FILE', filePath)

      log.warn('UNKNOWN_FILETYPE_UPLOAD_DELETED', filePath)
      await try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR')
      return
    }

    await XmlParser.convertToFile(filePath)

    await try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR')
  })
}

module.exports.run = RunVplanReceiver