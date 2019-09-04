const path = require('path')

const promiseFs = require('util/promisified').fs

const { exec } = require('util/promisified').child_process

const WebSocketSync = require('services/WebSocketSync')

const UploadWatcher = require('services/UploadWatcher')

async function RunVplanReceiver() {
  UploadWatcher({
    added: async (queueDay, vplan) => {
      const vplanFilePath = path.format({
        dir: path.join('share/upload/', queueDay),
        // types: students / teachers
        name: vplan.type,
        ext: '.json',
      })

      await try_(
        promiseFs.writeFile(vplanFilePath, JSON.stringify(vplan, null, 2)),
        'FILE_WRITE_ERR',
      )
      log.info('VPLAN_FILE_ADDED', vplanFilePath)

      WebSocketSync.reloadAll()

      try_(exec(`./ftp_put.sh ${vplanFilePath}`), 'FTP_WEB_SYNC_FAILED')
    },
    changed: (queueDay, filePath) => {
      log.info('VPLAN_FILE_UPDATED', filePath)
      WebSocketSync.reloadAll()

      try_(exec(`./ftp_put.sh ${filePath}`), 'FTP_WEB_SYNC_FAILED')
    },
    deleted: (queueDay, filePath) => {
      log.warn('VPLAN_FILE_REMOVED', filePath)
      WebSocketSync.reloadAll()

      try_(exec(`./ftp_delete.sh ${filePath}`), 'FTP_WEB_SYNC_FAILED')
    },
  })
}

module.exports.run = RunVplanReceiver
