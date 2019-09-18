const chokidar = require('chokidar')
const path = require('path')

const promiseFs = require('util/promisified').fs

const XmlParser = require('lib/XmlParser')
const VPlanParser = require('lib/VPlanParser')

const DataManager = require('services/DataManager')

const isFileType = (filePath, typeFileExtension) => path.extname(filePath) === `.${typeFileExtension}`

module.exports = async function FileWatcher(handler) {
  log.info('WATCHING_UPLOAD_DIR', path.normalize(DataManager.Paths.uploadDir))

  // Watch uploadDir
  chokidar.watch(DataManager.Paths.uploadDir, {
    awaitWriteFinish: true,
  })
    .on('add', async (filePath) => {
      log.debug('UPLOAD_DETECTED', filePath)

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

      const vplan = await VPlanParser.parse(rawVPlan)

      if (!vplan) {
        log.err('INVALID_VPLAN_FORMAT')
        return
      }

      // Checks if encoding is utf8
      XmlParser.testEncoding(rawVPlan)

      // Queueday determination
      const queueDay = VPlanParser.getQueueDay(vplan)
      if (!queueDay) {
        log.warn('QUEUEDAY_DETERMINATION_FAILED', filePath)
        try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR')
        return
      }

      handler.vplanUploaded({ queueDay, vplan })
    })

  // Watch dataDir
  chokidar.watch(DataManager.Paths.dataDir, {
    awaitWriteFinish: true,
  })
    .on('add', async (filePath) => {
      log.debug('FILE_DETECTED', filePath)

      if (!isFileType(filePath, 'json')) {
        log.warn('UNKNOWN_FILETYPE_DELETING_FILE', filePath)
        try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR')
        return
      }

      const { type, queue } = DataManager.Paths.parseVplanPath(filePath)
      handler.vplanRegistered({ type, queue })
    })
    .on('change', async (filePath) => {
      log.debug('FILE_CHANGED', filePath)

      const { type, queue } = DataManager.Paths.parseVplanPath(filePath)
      handler.vplanChanged({ type, queue })
    })
    .on('unlink', async (filePath) => {
      log.debug('FILE_REMOVED', filePath)

      if (!isFileType(filePath, 'json')) return

      const { type, queue } = DataManager.Paths.parseVplanPath(filePath)
      handler.vplanRemoved({ type, queue })
    })
}
