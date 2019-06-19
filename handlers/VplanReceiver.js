const path = require('path')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified').fs

const { exec } = require('util/promisified').child_process

const FrontendNotifier = require('services/FrontendNotifier')

const UploadWatcher = require('services/UploadWatcher')

async function RunVplanReceiver() {
  UploadWatcher({
    added: async (queueDay, vplan) => {
      const vplanFilePath = path.format({
        dir: path.join('upload/', queueDay),
        // types: students / teachers
        name: vplan.type,
        ext: '.json',
      })

      await try_(
        promiseFs.writeFile(vplanFilePath, JSON.stringify(vplan, null, 2)),
        'FILE_WRITE_ERR',
      )
      log.info('VPLAN_FILE_ADDED', vplanFilePath)

      FrontendNotifier.reloadAll()

      try_(exec(`./ftp_put.sh ${vplanFilePath}`), 'FTP_WEB_SYNC_FAILED')
    },
    changed: (queueDay, filePath) => {
      log.info('VPLAN_FILE_UPDATED', filePath)
      FrontendNotifier.reloadAll()

      try_(exec(`./ftp_put.sh ${filePath}`), 'FTP_WEB_SYNC_FAILED')
    },
    deleted: (queueDay, filePath) => {
      log.warn('VPLAN_FILE_REMOVED', filePath)
      FrontendNotifier.reloadAll()

      try_(exec(`./ftp_delete.sh ${filePath}`), 'FTP_WEB_SYNC_FAILED')
    },
  })
}

module.exports.run = RunVplanReceiver
