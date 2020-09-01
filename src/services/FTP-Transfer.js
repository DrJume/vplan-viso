const pathTools = require('path')

const PromiseFTP = require('promise-ftp')

const { debounce } = require('util/reactive-tools')
const exitHandler = require('util/exit-handler')

class FTPClient {
  constructor() {
    this.client = new PromiseFTP()

    this.tasks = []
    this.running = false
    this.debouncedRunTasks = debounce(() => this._runTasks(), 2000)
  }

  async _isConnected() {
    if (Config.ftp.host === '') return false

    log.debug('FTP_CURRENT_CONNECTION_STATUS', this.client.getConnectionStatus())

    switch (this.client.getConnectionStatus()) {
      case PromiseFTP.STATUSES.NOT_YET_CONNECTED: {
        const [err] = await try_(this.client.connect({
          ...Config.ftp,
          autoReconnect: true,
        }), 'FTP_CONNECT_ERR')
        if (!err) log.debug('FTP_CONNECTED')

        return !err
      }

      case PromiseFTP.STATUSES.DISCONNECTED: {
        const [err] = await try_(this.client.reconnect(), 'FTP_RECONNECT_ERR')
        if (!err) log.debug('FTP_RECONNECTED')

        return !err
      }

      case PromiseFTP.STATUSES.CONNECTED: {
        log.debug('FTP_ALREADY_CONNECTED')
        return true
      }

      case PromiseFTP.STATUSES.CONNECTING:
      case PromiseFTP.STATUSES.RECONNECTING:
      case PromiseFTP.STATUSES.DISCONNECTING:
      case PromiseFTP.STATUSES.LOGGING_OUT: {
        log.warn('FTP_CONNECTION_DANGLING', this.client.getConnectionStatus())
        await new Promise(r => setTimeout(r, 2000)) // wait for 2s
        return this._isConnected
      }

      default: {
        log.err('FTP_UNKNOWN_STATUS', this.client.getConnectionStatus())
        return false
      }
    }
  }

  async _runTasks() {
    if (this.tasks.length === 0) return
    if (this.running) {
      log.warn('FTP_TASKS_ALREADY_RUNNING')
      return
    }
    this.running = true

    if (!await this._isConnected()) {
      this.running = false
      return
    }

    const poppedTasks = this.tasks.splice(0)
    log.debug('FTP_TASKS', poppedTasks.map(task => task.path))

    // eslint-disable-next-line no-restricted-syntax
    for await (const task of poppedTasks) {
      const combinedPath = pathTools.join('/', Config.ftp.baseDir, task.path)

      let err
      [err] = await try_(this.client.mkdir(pathTools.dirname(combinedPath), true), 'FTP_MKDIR_ERR');
      [err] = await try_(this.client.cwd(pathTools.dirname(combinedPath)), 'FTP_CHDIR_ERR')
      if (err) {
        await try_(this.client.end(), 'FTP_END_ERR')
        this.running = false
        return
      }

      await task.callback({ client: this.client, combinedPath })
    }

    if (this.tasks.length > 0) {
      log.debug('FTP_FOUND_MORE_TASKS')
      this.running = false
      await this._runTasks()
    } else {
      log.debug('FTP_DISCONNECT')
      await try_(this.client.end(), 'FTP_END_ERR')
    }
    this.running = false
  }

  async upload(path, data) {
    log.debug('FTP_UPLOAD_QUEUED', path)
    this.tasks.push({
      path,
      callback: async ({ client, combinedPath }) => {
        log.info('FTP_UPLOAD', combinedPath)

        await try_(client.put(
          data,
          pathTools.basename(path),
        ), 'FTP_UPLOAD_ERR')
      },
    })

    this.debouncedRunTasks()
  }

  async delete(path) {
    log.debug('FTP_DELETE_QUEUED', path)
    this.tasks.push({
      path,
      callback: async ({ client, combinedPath }) => {
        log.info('FTP_DELETE', combinedPath)

        await try_(client.delete(
          pathTools.basename(path),
        ), 'FTP_DELETE_ERR')
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
