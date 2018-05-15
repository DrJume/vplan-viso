const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')
const moment = require('moment')

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
    .on('add', async (filePath) => {
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
      const vplanEncoding = vplanData._declaration.$.encoding
      const UTF8Regex = /utf(-?)8/gi
      if (!UTF8Regex.test(vplanEncoding)) {
        log.warn('VPLAN_UNKNOWN_STRING_ENCODING', vplanEncoding)
      }

      // queueday determination

      // on manual upload
      if (['current', 'next'].includes(uploadLocation)) {
        log.info('MANUAL_UPLOAD')
        log.info('DETECTING_QUEUEDAY_BY_UPLOAD_DIR')

        callback(uploadLocation, transformedVplanData, vplanType)
        return
      }

      // normal upload

      // get date string from vplan title
      const queueDateString = transformedVplanData.head.title.trim()
      log.debug('VPLAN_TITLE_QUEUEDATE_STRING', queueDateString)
      const queueDate = moment(queueDateString, 'dddd, D. MMMM YYYY')

      // when not parseable date, delete uploaded vplan
      if (!queueDate.isValid()) {
        log.err('TITLE_QUEUEDATE_PARSING_ERR', queueDateString)

        log.warn('UNKNOWN_QUEUEDAY_UPLOAD_DELETED', filePath)
        try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR')
        return
      }

      log.info('DETECTING_QUEUEDAY_BY_DATE_CALC')

      const today = moment()
      log.debug('QUEUEDATE', queueDate)
      log.debug('TODAY', today)
      log.debug('IS_AFTER_TODAY', queueDate.isAfter(today))

      const queueDay = queueDate.isAfter(today) ? 'next' : 'current'
      log.debug('QUEUEDAY', queueDay)

      callback(queueDay, transformedVplanData, vplanType)
    })
}
