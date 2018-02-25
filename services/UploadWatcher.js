const chokidar = require('chokidar')
const fs = require('fs')

const try_ = require('helpers/try-wrapper') // eslint-disable-line import/no-unresolved
const promiseFs = require('helpers/promisified-fs') // eslint-disable-line import/no-unresolved

const uploadDir = 'upload/'
const heuteDir = 'heute/'
const morgenDir = 'morgen/'

module.exports = async function UploadWatcher(callback) {
  if (
    !fs.existsSync(uploadDir) ||
    !fs.existsSync(uploadDir + heuteDir) ||
    !fs.existsSync(uploadDir + morgenDir)
  ) {
    log.err('UPLOAD_DIR_TREE_CORRUPT')

    await try_(promiseFs.mkdir(uploadDir))
    await try_(promiseFs.mkdir(uploadDir + heuteDir))
    await try_(promiseFs.mkdir(uploadDir + morgenDir))
  }

  log.info(`WATCHING_UPLOAD_DIR: ${uploadDir}`)

  chokidar.watch(uploadDir, {
    cwd: '.',
    awaitWriteFinish: true,
  })
    .on('add', async (pathReturned) => {
      const path = pathReturned.replace(uploadDir, '')

      if (path.startsWith(heuteDir)) {
        const filename = path.replace(heuteDir, '')
        callback('heute', filename)
        return
      }
      if (path.startsWith(morgenDir)) {
        const filename = path.replace(morgenDir, '')
        callback('morgen', filename)
        return
      }

      // Uploaded to wrong directory (not in heute/ or morgen/)
      callback(undefined, path)

      const fullFilePath = uploadDir + path
      log.warn(`UNVALID_UPLOAD_GETS_DELETED: ${fullFilePath}`)

      await try_(promiseFs.unlink(fullFilePath))
    })
}
