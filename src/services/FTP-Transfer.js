const pathTools = require('path')

const PromiseFTP = require('promise-ftp')

const { debounce } = require('util/reactive-tools')
const exitHandler = require('util/exit-handler')

class FTPClient {
  constructor() {
    this.client = new PromiseFTP()

    this.tasks = []
    this.debouncedRunTasks = debounce(() => this._runTasks(), 1000)
  }

  async _connect() {
    if (Config.ftp.host === '') return false

    log.debug('FTP_STATUS', this.client.getConnectionStatus())

    switch (this.client.getConnectionStatus()) {
      case PromiseFTP.STATUSES.NOT_YET_CONNECTED: {
        const [err] = await try_(this.client.connect({
          ...Config.ftp,
          autoReconnect: true,
        }), 'FTP_CONNECT_ERR')

        return !!err
      }

      case PromiseFTP.STATUSES.DISCONNECTED: {
        const [err] = await try_(this.client.reconnect(), 'FTP_RECONNECT_ERR')

        return !!err
      }

      case PromiseFTP.STATUSES.CONNECTED: {
        log.debug('FTP_ALREADY_CONNECTED')

        return false
      }

      case PromiseFTP.STATUSES.CONNECTING:
      case PromiseFTP.STATUSES.RECONNECTING: {
        log.err('FTP_CONNECTION_DANGLING', this.client.getConnectionStatus())
        return false
      }

      case PromiseFTP.STATUSES.DISCONNECTING:
      case PromiseFTP.STATUSES.LOGGING_OUT: {
        log.err('FTP_CONNECTION_CLOSING', this.client.getConnectionStatus())
        return false
      }

      default: {
        log.err('FTP_UNKNOWN_STATUS', this.client.getConnectionStatus())
        return false
      }
    }
  }

  async _runTasks() {
    if (!await this._connect()) return

    log.debug('FTP_TASKS', this.tasks.map(task => task.path))
    // eslint-disable-next-line no-restricted-syntax
    for await (const [index, task] of Object.entries(this.tasks)) {
      const combinedPath = pathTools.join('/', Config.ftp.baseDir, task.path)

      let err
      [err] = await try_(this.client.mkdir(pathTools.dirname(combinedPath), true), 'FTP_MKDIR_ERR');
      [err] = await try_(this.client.cwd(pathTools.dirname(combinedPath)), 'FTP_CHDIR_ERR')
      if (err) {
        await try_(this.client.end(), 'FTP_END_ERR')
        return
      }

      await task.callback({ client: this.client, combinedPath })
      this.tasks.splice(index)
    }

    await try_(this.client.end(), 'FTP_END_ERR')
    if (Object.entries(this.tasks).length > 0) this.runTasks()
  }

  async upload(path, data) {
    this.tasks.push({
      path,
      callback: async ({ client, combinedPath }) => {
        log.debug('FTP_UPLOAD', combinedPath)

        await try_(client.put(
          data,
          pathTools.basename(path),
        ), 'FTP_PUT_ERR')
      },
    })

    this.debouncedRunTasks()
  }

  async delete(path) {
    this.tasks.push({
      path,
      callback: async ({ client, combinedPath }) => {
        log.debug('FTP_DELETE', combinedPath)

        await try_(client.delete(
          pathTools.basename(path),
        ), 'FTP_WEB_SYNC_DELETE_ERR')
      },
    })

    this.debouncedRunTasks()
  }
}

const FTPClientInstance = new FTPClient()
module.exports = FTPClientInstance

exitHandler.addHandler(() => {
  log.debug('FTP_DESTROY_CONNECTION_ON_EXIT')
  try_(() => FTPClientInstance.client.destroy(), 'FTP_DESTROY_ERR')
})
