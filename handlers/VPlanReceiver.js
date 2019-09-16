const fs = require('fs')
const { exec } = require('util/promisified').child_process
const ftp = require('basic-ftp')

const WebSocketSync = require('services/WebSocketSync')
const UploadWatcher = require('services/UploadWatcher')
const FileManager = require('services/FileManager')

async function ftpPut(filePath) {
  const client = new ftp.Client()
  const [err] = await try_(client.access({
    ...Config.ftp,
  }), 'FTP_WEB_SYNC_CONNECTION_ERR')
  if (err) return

  await try_(client.upload(fs.createReadStream(filePath), filePath.match(/share\/(.*)/)[1]), 'FTP_WEB_SYNC_PUT_ERR')

  client.close()
}

async function ftpDelete(filePath) {
  const client = new ftp.Client()
  const [err] = await try_(client.access({
    ...Config.ftp,
  }), 'FTP_WEB_SYNC_CONNECTION_ERR')
  if (err) return

  await try_(client.remove(filePath.match(/share\/(.*)/)[1]), 'FTP_WEB_SYNC_DELETE_ERR')

  client.close()
}


async function RunVPlanReceiver() {
  UploadWatcher(FileManager.Paths.uploadDir, {
    added: async (queueDay, vplan) => {
      const vplanFilePath = FileManager.Paths.vplan({ type: vplan._type, queue: queueDay })

      await try_(
        FileManager.write(vplanFilePath, JSON.stringify(vplan, null, 2)),
        'FILE_WRITE_ERR',
      )
      log.info('VPLAN_FILE_ADDED', vplanFilePath)

      // WebSocketSync.reloadAll()

      log.debug('FTP_PUT', vplanFilePath)
      await ftpPut(vplanFilePath)
    },
    changed: async (queueDay, filePath) => {
      log.info('VPLAN_FILE_UPDATED', filePath)
      // WebSocketSync.reloadAll()

      log.debug('FTP_PUT', filePath)
      await ftpPut(filePath)
    },
    deleted: async (queueDay, filePath) => {
      log.warn('VPLAN_FILE_REMOVED', filePath)
      // WebSocketSync.reloadAll()

      log.debug('FTP_DELETE', filePath)
      await ftpDelete(filePath)
    },
  })
}

module.exports.run = RunVPlanReceiver
