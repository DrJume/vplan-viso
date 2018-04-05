const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified-fs')

const uploadDir = 'upload'
const currentVplanDir = 'current'
const nextVplanDir = 'next'
const currentVplanPath = path.join(uploadDir, currentVplanDir)
const nextVplanPath = path.join(uploadDir, nextVplanDir)

module.exports = async function UploadWatcher(callback) {
  if (
    !fs.existsSync(uploadDir) ||
    !fs.existsSync(currentVplanPath) ||
    !fs.existsSync(nextVplanPath)
  ) {
    log.warn('UPLOAD_DIR_TREE_CORRUPT')
    log.info('CREATING_UPLOAD_DIR')

    await try_(promiseFs.mkdir(uploadDir), 'warn:IGNORE_IF_EEXIST')
    await try_(promiseFs.mkdir(currentVplanPath), 'warn:IGNORE_IF_EEXIST')
    await try_(promiseFs.mkdir(nextVplanPath), 'warn:IGNORE_IF_EEXIST')
  }

  log.info('WATCHING_UPLOAD_DIR', path.resolve(uploadDir))

  chokidar.watch(uploadDir, {
    cwd: '.',
    awaitWriteFinish: true,
  })
    .on('add', async (fullUploadPath) => {
      // get the last folder name in the uploadPath
      const uploadLocation = path.parse(fullUploadPath).dir.split(path.sep).pop()

      if (!['current', 'next'].includes(uploadLocation)) {
        // Uploaded to wrong directory (not in current/ or next/)
        log.warn('INVALID_LOCATION_UPLOAD_DELETED', fullUploadPath)

        try_(promiseFs.unlink(fullUploadPath), 'FILE_DELETE_ERR')
        return
      }

      callback(uploadLocation, fullUploadPath)
    })
}
