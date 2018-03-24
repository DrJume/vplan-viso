const chokidar = require('chokidar')
const fs = require('fs')
const pathTools = require('path')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified-fs')

const uploadDir = `upload${pathTools.sep}`
const heuteDir = `heute${pathTools.sep}`
const morgenDir = `morgen${pathTools.sep}`
const heutePath = pathTools.join(uploadDir, heuteDir)
const morgenPath = pathTools.join(uploadDir, morgenDir)

module.exports = async function UploadWatcher(callback) {
  if (
    !fs.existsSync(uploadDir) ||
    !fs.existsSync(heutePath) ||
    !fs.existsSync(morgenPath)
  ) {
    log.warn('UPLOAD_DIR_TREE_CORRUPT')
    log.info('CREATING_UPLOAD_DIR')

    await try_(promiseFs.mkdir(uploadDir), { logLabel: 'IGNORE_IF_EEXIST' })
    await try_(promiseFs.mkdir(heutePath), { logLabel: 'IGNORE_IF_EEXIST' })
    await try_(promiseFs.mkdir(morgenPath), { logLabel: 'IGNORE_IF_EEXIST' })
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

      await try_(promiseFs.unlink(fullFilePath))
    })
}
