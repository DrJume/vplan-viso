const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified').fs
const { deepCountKeys } = require('util/object-tools')

const DefaultConfig = {
  Webserver_Port: 8000,
  Update_PreRelease: false,
}

module.exports = async function readConfig(path) {
  log.info('READING_CONFIG', path)

  let readErr, configData // eslint-disable-next-line prefer-const
  [readErr, configData] = await try_(
    promiseFs.readFile(path),
    'warn:READ_CONFIG_ERR',
  )

  if (readErr) {
    log.info('WRITING_DEFAULT_CONFIG')

    try_(promiseFs.writeFile(
      path,
      JSON.stringify(DefaultConfig, null, 2), // beautify JSON
    ), 'warn:DEFAULT_CONFIG_WRITE_FAILED')

    log.info('SERVING_DEFAULT_CONFIG')
    return DefaultConfig
  }

  // Config file read success

  let parseErr, parsedConfig // eslint-disable-next-line prefer-const
  [parseErr, parsedConfig] = try_(() => JSON.parse(configData), 'CONFIG_PARSE_ERR')

  if (parseErr) process.exit(1)

  // Apply default config keys when not exist
  if (deepCountKeys(DefaultConfig) !== deepCountKeys(parsedConfig)) {
    log.info('PATCH_CONFIG_WITH_DEFAULTS')
    parsedConfig = Object.assign(DefaultConfig, parsedConfig)

    try_(promiseFs.writeFile(
      path,
      JSON.stringify(parsedConfig, null, 2), // beautify JSON
    ), 'FILE_WRITE_ERR')
  }

  return parsedConfig
}
