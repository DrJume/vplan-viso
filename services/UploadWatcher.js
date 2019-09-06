const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')

const promiseFs = require('util/promisified').fs

const uploadDir = 'share/upload/'
const currentVPlanPath = path.join(uploadDir, 'current')
const nextVPlanPath = path.join(uploadDir, 'next')

const XmlParser = require('lib/XmlParser')
const VPlanParser = require('lib/VPlanParser')

const isFileType = (filePath, typeFileExtension) => path.extname(filePath) === `.${typeFileExtension}`

async function makeDirectoryHelper(dirPath) {
  const [err] = await try_(promiseFs.mkdir(dirPath), 'silenced:MAKE_DIR_ERR')

  if (!err) return
  if (err.code === 'EEXIST') return // ignore "directory already exists" error
  log.err('MAKE_DIR_ERR', err)
}

module.exports = async function UploadWatcher(handler) {
  if (
    !fs.existsSync(uploadDir)
    || !fs.existsSync(currentVPlanPath)
    || !fs.existsSync(nextVPlanPath)
  ) {
    log.info('RECREATING_UPLOAD_DIR_TREE')

    await makeDirectoryHelper(uploadDir)
    makeDirectoryHelper(currentVPlanPath)
    makeDirectoryHelper(nextVPlanPath)
  }

  log.info('WATCHING_UPLOAD_DIR', path.resolve(uploadDir))

  chokidar.watch(uploadDir, {
    cwd: '.',
    awaitWriteFinish: true,
  })
    .on('unlink', async (filePath) => {
      log.debug('FILE_REMOVED', filePath)

      // get the last folder name in the uploadPath
      const fileDir = path.parse(filePath).dir.split(path.sep).pop()

      if (isFileType(filePath, 'json')) {
        if (['current', 'next'].includes(fileDir)) {
          handler.deleted(fileDir, filePath)
        }
      }
    })
    .on('change', async (filePath) => {
      // get the last folder name in the uploadPath
      const fileDir = path.parse(filePath).dir.split(path.sep).pop()

      if (isFileType(filePath, 'json')) {
        handler.changed(fileDir, filePath)
      }
    })
    .on('add', async (filePath) => {
      log.debug('FILE_DETECTED', filePath)

      // get the last folder name in the uploadPath
      const fileDir = path.parse(filePath).dir.split(path.sep).pop()

      if (isFileType(filePath, 'json')) {
        if (!['current', 'next'].includes(fileDir)) {
          log.warn('UNKNOWN_QUEUEDAY_JSON_FILE_DELETED', filePath)

          try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR')
          return
        }

        log.info('VPLAN_FILE_LOADED', filePath)
        return
      }

      if (!isFileType(filePath, 'xml')) {
        log.warn('UNKNOWN_FILETYPE_UPLOAD_DELETED', filePath)
        try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR')
        return
      }

      const rawVPlan = await XmlParser.XMLtoRawVPlan(filePath)
      try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR') // delete old xml file

      if (!rawVPlan) {
        log.err('INVALID_VPLAN_FORMAT')
        return
      }

      // callback('current', vplanData, 'debug') // only for debug purposes!!!
      const vplan = await VPlanParser.parse(rawVPlan)

      if (!vplan) {
        log.err('INVALID_VPLAN_FORMAT')
        return
      }

      // checks if encoding is utf8
      XmlParser.testEncoding(rawVPlan)

      // Queueday determination

      // manual upload
      if (['current', 'next'].includes(fileDir)) {
        log.info('MANUAL_SCHEDULING', `${vplan._type}: [${vplan.head.title}]`)
        log.debug('QUEUEDAY_BY_UPLOAD_DIR')

        handler.added(fileDir, vplan)
        return
      }

      // normal upload
      const queueDay = VPlanParser.getQueueDay(vplan)
      if (!queueDay) {
        log.warn('UNKNOWN_QUEUEDAY_UPLOAD_DELETED', filePath)
        try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR')
        return
      }

      handler.added(queueDay, vplan)
    })
}
