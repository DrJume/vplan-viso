const xmlConvert = require('xml-js')
const path = require('path')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified-fs')

const Parser = {
  async convertToFile(filePath) {
    let err, xmlData // eslint-disable-next-line prefer-const
    [err, xmlData] = await try_(
      promiseFs.readFile(filePath, { encoding: 'utf-8' }),
      'FILE_READ_ERR',
    )
    if (err) return

    let jsonData // eslint-disable-next-line prefer-const
    [err, jsonData] = try_(() => xmlConvert.xml2json( // try-wrapper on syncronous func
      xmlData,
      { compact: true, attributesKey: '$', textKey: '_' },
    ), 'XML_PARSE_ERR')
    if (err) return

    const jsonFilePath = path.format({
      dir: path.dirname(filePath),
      // name: path.basename(filePath, path.extname(filePath)),
      name: 'upload',
      ext: '.json',
    })
    log.debug('JSON_NEW_FILEPATH', jsonFilePath);

    [err] = await try_(
      promiseFs.writeFile(jsonFilePath, jsonData),
      'FILE_WRITE_ERR',
    )
  },
}

module.exports = Parser
