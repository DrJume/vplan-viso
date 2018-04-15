const path = require('path')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified-fs')

const UploadWatcher = require('services/UploadWatcher')

async function RunVplanReceiver() {
  UploadWatcher(async (queueDay, vplanData, vplanType) => {
    const jsonFilePath = path.format({
      dir: path.join('upload/', queueDay),
      // name: students / teachers
      name: vplanType,
      ext: '.json',
    })
    log.debug('JSON_NEW_FILEPATH', jsonFilePath)

    try_(
      promiseFs.writeFile(jsonFilePath, JSON.stringify(vplanData, null, 2)),
      'FILE_WRITE_ERR',
    )
  })
}

module.exports.run = RunVplanReceiver
