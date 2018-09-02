const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified').fs

const uploadDir = 'upload'
const currentVplanPath = path.join(uploadDir, 'current')
const nextVplanPath = path.join(uploadDir, 'next')

const XmlParser = require('lib/XmlParser')
const VplanParser = require('lib/VplanParser')

const FrontendNotifier = require('services/FrontendNotifier')

async function makeDirectoryHelper(dirPath) {
  const [err] = await try_(promiseFs.mkdir(dirPath), 'ignore:MAKE_DIR_ERR')

  if (!err) return
  if (err.code === 'EEXIST') return // ignore "directory already exists" error
  log.err('MAKE_DIR_ERR', err)
}

module.exports = async function UploadWatcher(callback) {
  if (
    !fs.existsSync(uploadDir)
    || !fs.existsSync(currentVplanPath)
    || !fs.existsSync(nextVplanPath)
  ) {
    log.info('RECREATING_UPLOAD_DIR_TREE')

    await makeDirectoryHelper(uploadDir)
    await makeDirectoryHelper(currentVplanPath)
    await makeDirectoryHelper(nextVplanPath)
  }

  log.info('WATCHING_UPLOAD_DIR', path.resolve(uploadDir))

  chokidar.watch(uploadDir, {
    cwd: '.',
    awaitWriteFinish: true,
  })
    .on('unlink', async (filePath) => {
      log.debug('FILE_REMOVED', filePath)

      // get the last folder name in the uploadPath
      const uploadLocation = path.parse(filePath).dir.split(path.sep).pop()

      if (path.extname(filePath) === '.json') {
        if (['current', 'next'].includes(uploadLocation)) {
          // used vplan was deleted, refresh displays
          log.warn('VPLAN_FILE_REMOVED', filePath)
          FrontendNotifier.reloadAll()
        }
      }
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

      const vplanData = await XmlParser.convertFileToJSObject(filePath)
      try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR') // delete old xml file

      // callback('current', vplanData, 'debug') // only for debug purposes!!!
      const { transformedVplanData, vplanType } = await VplanParser.transform(vplanData)

      if (!transformedVplanData) {
        log.err('INVALID_VPLAN_FORMAT')
        return
      }

      // checks if encoding is utf8
      XmlParser.checkEncoding(vplanData)

      // Queueday determination

      // manual upload
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
