const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified-fs')

const uploadDir = 'upload'
const heuteDir = 'heute'
const morgenDir = 'morgen'
const heutePath = path.join(uploadDir, heuteDir)
const morgenPath = path.join(uploadDir, morgenDir)

module.exports = async function UploadWatcher(callback) {
  if (
    !fs.existsSync(uploadDir) ||
    !fs.existsSync(heutePath) ||
    !fs.existsSync(morgenPath)
  ) {
    log.warn('UPLOAD_DIR_TREE_CORRUPT')
    log.info('CREATING_UPLOAD_DIR')

    await try_(promiseFs.mkdir(uploadDir), 'warn:IGNORE_IF_EEXIST')
    await try_(promiseFs.mkdir(heutePath), 'warn:IGNORE_IF_EEXIST')
    await try_(promiseFs.mkdir(morgenPath), 'warn:IGNORE_IF_EEXIST')
  }

  log.info('WATCHING_UPLOAD_DIR', uploadDir)

  chokidar.watch(uploadDir, {
    cwd: '.',
    awaitWriteFinish: true,
  })
    .on('add', async (fullFilePath) => {
      const dayPath = fullFilePath.replace(uploadDir, '')

      if (dayPath.startsWith(heuteDir)) {
        callback('heute', fullFilePath)
        return
      }
      if (dayPath.startsWith(morgenDir)) {
        callback('morgen', fullFilePath)
        return
      }

      // Uploaded to wrong directory (not in heute/ or morgen/)
      log.warn('INVALID_LOCATION_UPLOAD_DELETED', fullFilePath)

      await try_(promiseFs.unlink(fullFilePath), 'FILE_DELETE_ERR')
    })
}
