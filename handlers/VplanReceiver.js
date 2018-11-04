const path = require('path')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified').fs

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
    },
    changed: (queueDay, filePath) => {
      log.info('VPLAN_FILE_UPDATED', filePath)
      FrontendNotifier.reloadAll()
    },
    deleted: (queueDay, filePath) => {
      log.warn('VPLAN_FILE_REMOVED', filePath)
      FrontendNotifier.reloadAll()
    },
  })
}

module.exports.run = RunVplanReceiver
