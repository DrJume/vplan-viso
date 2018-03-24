const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified-fs')

const DefaultConfig = {
  port: 8080,
}

module.exports = async function readConfig(path) {
  log.info('READING_CONFIG', path)

  let readErr, configData // eslint-disable-next-line prefer-const
  [readErr, configData] = await try_(promiseFs.readFile(path), {
    logLabel: 'FILE_READ_ERR',
  })

  if (readErr) {
    log.err('READ_CONFIG_ERR')

    log.info('WRITING_DEFAULT_CONFIG')
    let writeDefaultErr // eslint-disable-next-line prefer-const
    [writeDefaultErr] = await try_(promiseFs.writeFile(path, JSON.stringify(DefaultConfig)), {
      logLabel: 'FILE_WRITE_ERR',
    })

    if (writeDefaultErr) {
      log.warn('DEFAULT_CONFIG_WRITE_FAILED')
    }

    log.info('SERVING_DEFAULT_CONFIG')
    return DefaultConfig
  }

  // Config file read success

  let parseErr, parsedConfig // eslint-disable-next-line prefer-const
  [parseErr, parsedConfig] = try_(JSON.parse, {
    args: [configData],
    logLabel: 'JSON_PARSE_ERR',
  })

  if (parseErr) {
    log.err('CONFIG_PARSE_ERR')
    process.exit(1)
  }

  return parsedConfig
}
