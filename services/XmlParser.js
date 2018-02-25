const xmlConvert = require('xml-js')
const pathTools = require('path')

const promiseFs = require('helpers/promisified-fs')
const try_ = require('helpers/try-wrapper')

const Parser = {
  async parse(filePath) {
    let err, xmlData // eslint-disable-next-line prefer-const
    [err, xmlData] = await try_(
      promiseFs.readFile(filePath, { encoding: 'utf-8' }),
      { logLabel: 'FILE_READ_ERR' },
    )
    if (err) return

    let jsonData // eslint-disable-next-line prefer-const
    [err, jsonData] = try_(xmlConvert.xml2json, { // try-wrapper on syncronous func
      args: [xmlData,
        { compact: true, attributesKey: '$', textKey: '_' }],
      logLabel: 'XML_PARSE_ERR',
    })
    if (err) return

    const jsonFilePath = pathTools.format({
      dir: pathTools.dirname(filePath),
      name: pathTools.basename(filePath, pathTools.extname(filePath)),
      ext: '.json',
    })
    log.debug(jsonFilePath, 'JSON_NEW_FILEPATH');

    [err] = await try_(
      promiseFs.writeFile(jsonFilePath, jsonData),
      { logLabel: 'FILE_WRITE_ERR' },
    )
  },
}

module.exports = Parser
