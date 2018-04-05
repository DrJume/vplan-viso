const xmlConvert = require('xml-js')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified-fs')

const XmlParser = {
  async convertToJSObject(filePath) {
    let err, xmlData // eslint-disable-next-line prefer-const
    [err, xmlData] = await try_(
      promiseFs.readFile(filePath, { encoding: 'utf-8' }),
      'FILE_READ_ERR',
    )
    if (err) return undefined

    let jsonData // eslint-disable-next-line prefer-const
    [err, jsonData] = try_(() => xmlConvert.xml2json( // try-wrapper on syncronous func
      xmlData,
      { compact: true, attributesKey: '$', textKey: '_' },
    ), 'XML_PARSE_ERR')
    if (err) return undefined

    let jsObject // eslint-disable-next-line prefer-const
    [err, jsObject] = try_(() => JSON.parse(jsonData), 'JSON_PARSE_ERR')
    if (err) return undefined

    return jsObject
  },
}

module.exports = XmlParser
