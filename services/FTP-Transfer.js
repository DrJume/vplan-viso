const pathTools = require('path')
const { Readable } = require('stream')

const ftp = require('basic-ftp')

const { debounce } = require('util/reactive-tools')
const exitHandler = require('util/exit-handler')

class FTPClient {
  constructor() {
    this._client = undefined
    this.close = () => undefined
    this.tasks = []
    // eslint-disable-next-line consistent-return
    this.debouncedClient = debounce(async (callback) => {
      if (!this._client) {
        this._client = new ftp.Client()

        const success = await this._connect()
        callback(success ? this._client : undefined)
        return
      }
      if (this._client.closed) {
        const success = await this._connect()
        callback(success ? this._client : undefined)
        return
      }
      callback(this._client)
    }, 1000)
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

  runTasks() {
    this.debouncedClient(async client => {
      if (!client) {
        log.err('FTP_NO_CLIENT')
        return
      }
      // eslint-disable-next-line no-restricted-syntax
      for await (const [index, task] of Object.entries(this.tasks)) {
        const combinedPath = pathTools.join('/', Config.ftp.baseDir, task.path)

        const [err] = await try_(client.ensureDir(pathTools.dirname(combinedPath)), 'FTP_DIR_ERR')
        if (err) {
          this.close()
          return
        }

        await task.callback({ client, combinedPath })

        this.tasks.splice(index)
        this.close()
      }
    })
  }

  async upload(path, data) {
    this.tasks.push({
      path,
      callback: async ({ client, combinedPath }) => {
        log.debug('FTP_UPLOAD', combinedPath)

        await try_(client.upload(
          this._dataToReadableStream(data),
          pathTools.basename(path),
        ), 'FTP_WEB_SYNC_UPLOAD_ERR')
      },
    })

    this.runTasks()
  }

  async delete(path) {
    this.tasks.push({
      path,
      callback: async ({ client, combinedPath }) => {
        log.debug('FTP_DELETE', combinedPath)

        await try_(client.remove(
          pathTools.basename(path),
        ), 'FTP_WEB_SYNC_DELETE_ERR')
      },
    })

    this.runTasks()
  }
}

const FTPClientInstance = new FTPClient()
module.exports = FTPClientInstance

exitHandler.addHandler(() => {
  log.debug('FTP_CONNECTION_CLOSE_ON_EXIT')
  try_(() => FTPClientInstance._client.close(), 'silenced:FTPClientUnnecessaryClose')
})
