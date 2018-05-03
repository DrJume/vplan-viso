const axios = require('axios')
const semver = require('semver')
const tar = require('tar')

const os = require('os')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified').fs
const { exec } = require('util/promisified').child_process

const WebServer = require('handlers/WebServer')

const packageData = require('../package.json')

async function getUpdate() {
  log.info('GETTING_UPDATE')
  const [err, httpResponse] = await try_(axios.get('https://api.github.com/repos/drjume/vplan-viso/releases/latest'), 'HTTP_REQUEST_ERR#response.data#config.url')
  if (err) return undefined

  const latest = httpResponse.data

  const UpdateInfo = {
    latestVersion: semver.clean(latest.tag_name),
    packageVersion: semver.clean(packageData.version),
    isLatestNewer: semver.gt(latest.tag_name, packageData.version),
    isPreRelease: latest.prerelease,
    tarballUrl: latest.tarball_url,
  }

  return UpdateInfo
}

async function installUpdate(update) {
  if (!update) return

  log.info('INSTALLING_UPDATE')

  let err, httpResponse /* eslint-disable-next-line prefer-const */
  [err, httpResponse] = await try_(axios.get(update.tarballUrl, { responseType: 'arraybuffer' }), 'HTTP_REQUEST_ERR')
  if (err) return

  [err] = await try_(promiseFs.writeFile('Update.tar.gz', httpResponse.data), 'FILE_WRITE_ERR')
  if (err) return

  [err] = await try_(promiseFs.mkdir(`../vplan-viso-${update.latestVersion}`), 'MAKE_DIR_ERR')
  if (err) return

  [err] = await try_(tar.extract({
    file: 'Update.tar.gz',
    cwd: `../vplan-viso-${update.latestVersion}`,
    strip: 1,
  }), 'TAR_EXTRACT_ERR')

  let updateInstall /* eslint-disable-next-line prefer-const */
  [err, updateInstall] = await try_(exec('npm install', { cwd: `../vplan-viso-${update.latestVersion}` }), 'UPDATE_INSTALL_ERR')
  if (err) return

  log.info('UPDATE_INSTALL_STDOUT', os.EOL + updateInstall.stdout)
  log.info('UPDATE_INSTALL_STDERR', os.EOL + updateInstall.stderr)

  WebServer.stop()

  log.warn('STOPPING_CURRENT_INSTANCE')
  const exitCurrentInstance = setTimeout(async () => {
    log.warn('CURRENT_INSTANCE_EXIT')

    let instanceStop /* eslint-disable-next-line prefer-const */
    [err, instanceStop] = await try_(exec('npm stop'), 'INSTANCE_STOP_ERR')
    if (err) return

    log.info('CURRENT_INSTANCE_EXIT_STDOUT', os.EOL + instanceStop.stdout)
    log.info('CURRENT_INSTANCE_EXIT_STDERR', os.EOL + instanceStop.stderr)
  }, 5000)

  log.info('STARTING_UPDATE')

  let updateStart /* eslint-disable-next-line prefer-const */
  [err, updateStart] = await try_(exec('npm start', { cwd: `../vplan-viso-${update.latestVersion}` }), 'UPDATE_START_ERR')
  if (err) {
    clearTimeout(exitCurrentInstance)
    return
  }

  log.info('UPDATE_START_STDOUT', os.EOL + updateStart.stdout)
  log.info('UPDATE_START_STDERR', os.EOL + updateStart.stderr)
}

module.exports.getUpdate = getUpdate
module.exports.installUpdate = installUpdate
