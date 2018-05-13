const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified').fs
const { recursiveObjPatch } = require('util/object-tools')

const DefaultConfig = {
  webserver: { port: 8000 },
  update: { pre_release: false },
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

  // Filling default configuration with values from the given configuration
  log.info('PATCHING_CONFIG')
  parsedConfig = recursiveObjPatch(DefaultConfig, parsedConfig)

  try_(promiseFs.writeFile(
    path,
    JSON.stringify(parsedConfig, null, 2), // beautify JSON
  ), 'FILE_WRITE_ERR')


  return parsedConfig
}
