const axios = require('axios')
const semver = require('semver')
const tar = require('tar')

const os = require('os')
const path = require('path')

const try_ = require('helpers/try-wrapper')
const { fs: promiseFs, time: { delay } } = require('util/promisified')
const { exec } = require('util/promisified').child_process

const WebServer = require('handlers/WebServer')

const packageData = require('../package.json')

async function checkUpdate() {
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

async function runUpdate(update) {
  if (!update) return

  const updatePath = path.join('..', `vplan-viso-${update.latestVersion}`)

  log.info('DOWNLOADING_UPDATE')

  let err, httpResponse /* eslint-disable-next-line prefer-const */
  [err, httpResponse] = await try_(axios.get(update.tarballUrl, { responseType: 'arraybuffer' }), 'HTTP_REQUEST_ERR')
  if (err) return

  [err] = await try_(promiseFs.writeFile('Update.tar.gz', httpResponse.data), 'FILE_WRITE_ERR')
  if (err) return

  [err] = await try_(promiseFs.mkdir(updatePath), 'MAKE_DIR_ERR')
  if (err) return

  log.info('EXTRACTING_UPDATE');
  [err] = await try_(tar.extract({
    file: 'Update.tar.gz',
    cwd: updatePath,
    strip: 1,
  }), 'TAR_EXTRACT_ERR')
  if (err) return

  log.info('TRANSFERING_CONFIG');
  [err] = await try_(promiseFs.writeFile(path.join(updatePath, 'config.json'), JSON.stringify(Config)), 'FILE_WRITE_ERR')
  if (err) return

  log.info('INSTALLING_UPDATE')
  let updateInstall /* eslint-disable-next-line prefer-const */
  [err, updateInstall] = await try_(exec('npm install', { cwd: updatePath }), 'UPDATE_INSTALL_ERR')
  if (err) return

  log.debug('UPDATE_INSTALL_STDOUT', os.EOL + updateInstall.stdout)
  log.debug('UPDATE_INSTALL_STDERR', os.EOL + updateInstall.stderr)

  WebServer.stop()

  log.info('STARTING_UPDATE')
  let updateStart /* eslint-disable-next-line prefer-const */
  [err, updateStart] = await try_(exec('npm start', { cwd: updatePath }), 'UPDATE_START_ERR')
  if (err) {
    log.warn('UPDATE_ABORT')
    return
  }
  log.debug('UPDATE_START_STDOUT', os.EOL + updateStart.stdout)
  log.debug('UPDATE_START_STDERR', os.EOL + updateStart.stderr)

  // copying vplans to update directory with delay
  log.info('TRANSFER_DELAY')
  await delay(5000)

  log.info('TRANSFERING_VPLANS')

  const readVplan = (queueDay, type) => try_(
    promiseFs.readFile(path.join('upload/', queueDay, `${type}.json`), { encoding: 'utf-8' }),
    'FILE_READ_ERR',
  )
  const writeVplan = (queueDay, type, vplanData) => try_(
    promiseFs.writeFile(path.join(updatePath, 'upload/', queueDay, `${type}.json`), vplanData),
    'FILE_WRITE_ERR',
  )
  const transfer = (queueDay, type) =>
    readVplan(queueDay, type)
      .then(([partialErr, vplanData]) => (partialErr ? undefined : vplanData))
      .then(vplanData => writeVplan(queueDay, type, vplanData));


  [err] = await try_(Promise.all([
    Promise.reject(new Error('lol')),
    transfer('current', 'students'),
    transfer('current', 'teachers'),
    transfer('next', 'students'),
    transfer('next', 'teachers'),
  ]), 'BATCH_VPLAN_TRANSFER_ERR')
  if (err) return

  log.warn('STOPPING_CURRENT_INSTANCE')
  await try_(exec('npm stop'), 'INSTANCE_STOP_ERR')
}

module.exports.checkUpdate = checkUpdate
module.exports.runUpdate = runUpdate
