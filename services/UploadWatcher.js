const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified').fs

const uploadDir = 'upload'
const currentVplanPath = path.join(uploadDir, 'current')
const nextVplanPath = path.join(uploadDir, 'next')

const XmlParser = require('services/XmlParser')
const VplanParser = require('services/VplanParser')

module.exports = async function UploadWatcher(callback) {
  if (
    !fs.existsSync(uploadDir) ||
    !fs.existsSync(currentVplanPath) ||
    !fs.existsSync(nextVplanPath)
  ) {
    log.info('RECREATING_UPLOAD_DIR_TREE')

    await try_(promiseFs.mkdir(uploadDir), 'warn:IGNORE_IF_EEXIST')
    await try_(promiseFs.mkdir(currentVplanPath), 'warn:IGNORE_IF_EEXIST')
    await try_(promiseFs.mkdir(nextVplanPath), 'warn:IGNORE_IF_EEXIST')
  }

  log.info('WATCHING_UPLOAD_DIR', path.resolve(uploadDir))

  chokidar.watch(uploadDir, {
    cwd: '.',
    awaitWriteFinish: true,
  })
    .on('add', async (filePath) => { // TODO: add delete listener when vplan removed
      log.debug('FILE_DETECTED', filePath)

      // get the last folder name in the uploadPath
      const uploadLocation = path.parse(filePath).dir.split(path.sep).pop()

      if (path.extname(filePath) === '.json') {
        if (!['current', 'next'].includes(uploadLocation)) {
          log.warn('UNKNOWN_QUEUEDAY_JSON_FILE_DELETED', filePath)

          try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR')
          return
        }

        log.info('USING_JSON_FILE', filePath)
        return
      }

      if (path.extname(filePath) !== '.xml') {
        log.warn('UNKNOWN_FILETYPE_UPLOAD_DELETED', filePath)
        try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR')
        return
      }

      const vplanData = await XmlParser.convertToJSObject(filePath)
      const { transformedVplanData, vplanType } = await VplanParser.transform(vplanData)

      try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR') // delete old xml file

      if (!transformedVplanData) {
        log.err('INVALID_VPLAN_FORMAT')
        return
      }

      // checks if encoding is utf8
      XmlParser.checkEncoding(vplanData)

      // Queueday determination

      // on manual upload
      if (['current', 'next'].includes(uploadLocation)) {
        log.info('MANUAL_UPLOAD')
        log.info('DETECTING_QUEUEDAY_BY_UPLOAD_DIR')

        callback(uploadLocation, transformedVplanData, vplanType)
        return
      }

      // normal upload

      const queueDay = VplanParser.determineQueueDay(transformedVplanData)
      if (!queueDay) {
        log.warn('UNKNOWN_QUEUEDAY_UPLOAD_DELETED', filePath)
        try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR')
        return
      }

      callback(queueDay, transformedVplanData, vplanType)
    })
}
