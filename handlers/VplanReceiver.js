const path = require('path')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified-fs')

const UploadWatcher = require('services/UploadWatcher')
const XmlParser = require('services/XmlParser')
const VplanParser = require('services/VplanParser')

async function RunVplanReceiver() {
  UploadWatcher(async (queueDay, filePath) => {
    log.debug('FILE_APPEARED', `${queueDay}: ${filePath}`)

    if (path.extname(filePath) === '.json') {
      log.info('USING_JSON_FILE', filePath)
      return
    }

    if (path.extname(filePath) !== '.xml') {
      log.warn('UNKNOWN_FILETYPE_UPLOAD_DELETED', filePath)
      try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR')
      return
    }

    const vplanData = await XmlParser.convertToJSObject(filePath)
    const formattedVplanData = await VplanParser.format(vplanData)

    try_(promiseFs.unlink(filePath), 'FILE_DELETE_ERR') // delete old xml file

    if (!formattedVplanData) {
      log.err('INVALID_VPLAN_FORMAT')
      return
    }

    const vplanEncoding = vplanData._declaration.$.encoding
    const UTF8Regex = /utf(-?)8/gi
    if (!UTF8Regex.test(vplanEncoding)) { // checks if encoding is utf8
      log.warn('VPLAN_UNKNOWN_STRING_ENCODING', vplanEncoding)
    }

    const jsonFilePath = path.format({
      dir: path.dirname(filePath),
      // name: students / teacher
      name: 'upload',
      ext: '.json',
    })
    log.debug('JSON_NEW_FILEPATH', jsonFilePath)

    try_(
      promiseFs.writeFile(jsonFilePath, JSON.stringify(formattedVplanData, null, 2)),
      'FILE_WRITE_ERR',
    )
  })
}

module.exports.run = RunVplanReceiver
