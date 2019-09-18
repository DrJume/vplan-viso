const pathTools = require('path')
const { Readable } = require('stream')

const ftp = require('basic-ftp')

const { debounce } = require('util/reactive-tools')
const exitHandler = require('util/exit-handler')

class FTPClient {
  constructor() {
    this._client = undefined
    this.close = () => undefined
  }

  async _connect() {
    if (Config.ftp.host === '') return false

    const [err] = await try_(this._client.access({
      ...Config.ftp,
    }), 'FTP_WEB_SYNC_CONNECTION_ERR')
    if (err) return false

    this.close = debounce(() => {
      log.debug('FTP_DEBOUNCED_CONNECTION_CLOSED')
      this._client.close()
    }, 30 * 1000)

    return true
  }

  async getClient() {
    if (!this._client) {
      this._client = new ftp.Client()

      const success = await this._connect()
      return success ? this._client : undefined
    }
    if (this._client.closed) {
      const success = await this._connect()
      return success ? this._client : undefined
    }

    return this._client
  }

  /* eslint-disable-next-line class-methods-use-this */
  _dataToReadableStream(data) {
    return new Readable({
      objectMode: true,
      encoding: 'utf8',
      autoDestroy: true,
      read() {
        this.push(data)
        this.push(null)
      },
    })
  }

  async _prepare({ path: filePath, callback }) {
    const client = await this.getClient()
    if (!client) return

    const combinedPath = pathTools.join(Config.ftp.baseDir, filePath)

    const [err] = await try_(client.ensureDir(pathTools.dirname(combinedPath)), 'FTP_DIR_ERR')
    if (err) {
      this.close()
      return
    }

    await callback({ client, combinedPath })

    this.close()
  }

  async upload(path, data) {
    await this._prepare({
      path,
      callback: async ({ client, combinedPath }) => {
        log.debug('FTP_UPLOAD', combinedPath)

        await try_(client.upload(
          this._dataToReadableStream(data),
          pathTools.basename(path),
        ), 'FTP_WEB_SYNC_UPLOAD_ERR')
      },
    })
  }

  async delete(path) {
    await this._prepare({
      path,
      callback: async ({ client, combinedPath }) => {
        log.debug('FTP_DELETE', combinedPath)

        await try_(client.remove(
          pathTools.basename(path),
        ), 'FTP_WEB_SYNC_DELETE_ERR')
      },
    })
  }
}

const FTPClientInstance = new FTPClient()
module.exports = FTPClientInstance

exitHandler.addHandler(() => {
  log.debug('FTP_CONNECTION_CLOSE_ON_EXIT')
  try_(() => FTPClientInstance._client.close(), 'silenced:FTPClientUnnecessaryClose')
})
