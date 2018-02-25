const chokidar = require('chokidar')
const fs = require('fs')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('helpers/promisified-fs')

const uploadDir = 'upload/'
const heuteDir = 'heute/'
const morgenDir = 'morgen/'

module.exports = async function UploadWatcher(callback) {
  if (
    !fs.existsSync(uploadDir) ||
    !fs.existsSync(uploadDir + heuteDir) ||
    !fs.existsSync(uploadDir + morgenDir)
  ) {
    log.warn('UPLOAD_DIR_TREE_CORRUPT')
    log.info('CREATING_UPLOAD_DIR')

    await try_(promiseFs.mkdir(uploadDir), { logLabel: 'IGNORE_IF_EEXIST' })
    await try_(promiseFs.mkdir(uploadDir + heuteDir), { logLabel: 'IGNORE_IF_EEXIST' })
    await try_(promiseFs.mkdir(uploadDir + morgenDir), { logLabel: 'IGNORE_IF_EEXIST' })
  }

  log.info(`WATCHING_UPLOAD_DIR: ${uploadDir}`)

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

      log.warn(`UNVALID_UPLOAD_GETS_DELETED: ${fullFilePath}`)

      await try_(promiseFs.unlink(fullFilePath))
    })
}
