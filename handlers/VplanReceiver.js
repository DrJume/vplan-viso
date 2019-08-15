const path = require('path')
const promiseFs = require('util/promisified').fs
const fs = require('fs')
const { exec } = require('util/promisified').child_process
const ftp = require('basic-ftp')

const FrontendNotifier = require('services/FrontendNotifier')
const UploadWatcher = require('services/UploadWatcher')

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

      FrontendNotifier.reloadAll()

      log.debug('FTP_PUT', vplanFilePath)
      await ftpPut(vplanFilePath)
    },
    changed: async (queueDay, filePath) => {
      log.info('VPLAN_FILE_UPDATED', filePath)
      FrontendNotifier.reloadAll()

      log.debug('FTP_PUT', filePath)
      await ftpPut(filePath)
    },
    deleted: async (queueDay, filePath) => {
      log.warn('VPLAN_FILE_REMOVED', filePath)
      FrontendNotifier.reloadAll()

      log.debug('FTP_DELETE', filePath)
      await ftpDelete(filePath)
    },
  })
}

module.exports.run = RunVplanReceiver
