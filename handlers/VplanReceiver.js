const pathTools = require('path')

const promiseFs = require('helpers/promisified-fs')
const try_ = require('helpers/try-wrapper')

const UploadWatcher = require('services/UploadWatcher')
const XmlParser = require('services/XmlParser')

function RunVplanReceiver() {
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

    await try_(
      promiseFs.unlink(filePath),
      { logLabel: 'FILE_DELETE_ERR' },
    )
  })
}

module.exports.run = RunVplanReceiver
