const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified').fs
const { recursiveObjPatch } = require('util/object-tools')

const DefaultConfig = {
  webserver: { port: 8000, debug: false },
  updater: { pre_release: false },
  dev: { log_debug: false },
}

module.exports = async function readConfig(configPath) {
  log.info('READING_CONFIG', configPath)

  let readErr, configData // eslint-disable-next-line prefer-const
  [readErr, configData] = await try_(
    promiseFs.readFile(configPath, { encoding: 'utf-8' }),
    'warn:READ_CONFIG_ERR',
  )

  if (readErr) {
    log.info('WRITING_DEFAULT_CONFIG', DefaultConfig)

    try_(promiseFs.writeFile(
      configPath,
      JSON.stringify(DefaultConfig, null, 2), // beautify JSON
    ), 'warn:DEFAULT_CONFIG_WRITE_FAILED')

    log.info('SERVING_DEFAULT_CONFIG')
    return DefaultConfig
  }

  // Config file read success

  let parseErr, parsedConfig // eslint-disable-next-line prefer-const
  [parseErr, parsedConfig] = try_(() => JSON.parse(configData), 'CONFIG_PARSE_ERR')

  if (parseErr) {
    log.warn('DELETING_INVALID_CONFIG', configData)
    await try_(promiseFs.unlink(configPath), 'FILE_DELETE_ERR')

    log.warn('PROCESS_EXIT')
    process.exit(1)
  }

  // Filling default configuration with values from the given configuration
  log.info('PATCHING_CONFIG')
  parsedConfig = recursiveObjPatch(DefaultConfig, parsedConfig)

  try_(promiseFs.writeFile(
    configPath,
    JSON.stringify(parsedConfig, null, 2), // beautify JSON
  ), 'FILE_WRITE_ERR')


  return parsedConfig
}
