const axios = require('axios')
const semver = require('semver')
const tar = require('tar')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified-fs')

// const packageData = require('../package.json')
const packageData = {
  version: '0.15.0',
}

async function checkForUpdate() {
  const [err, httpResponse] = await try_(axios.get('https://api.github.com/repos/axios/axios/releases/latest'), 'HTTP_REQUEST_ERR')
  if (err) return undefined

  log.debug('', httpResponse.status)

  const latest = httpResponse.data

  const UpdateInfo = {
    latestVersion: semver.clean(latest.tag_name),
    packageVersion: semver.clean(packageData.version),
    isAvailable: semver.gt(latest.tag_name, packageData.version),
    isPrerelease: latest.prerelease,
    tarballUrl: latest.tarball_url,
  }

  log.debug('', UpdateInfo)

  log.debug('LATEST_VERSION', UpdateInfo.latestVersion)
  log.debug('PACKAGE_VERSION', UpdateInfo.packageVersion)
  log.debug('IS_LATEST_NEWER', UpdateInfo.isAvailable)

  return UpdateInfo
}

async function runUpdate() {
  let err, update /* eslint-disable-next-line prefer-const */
  [err, update] = await try_(checkForUpdate(), 'UPDATE_CHECK_FAILED')
  if (err) return

  log.debug('UPDATE_INFO', update)

  let httpResponse /* eslint-disable-next-line prefer-const */
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
}

async function finishUpdate() {
  log.info('FINISH_UPDATE')
}

module.exports.checkForUpdate = checkForUpdate
module.exports.runUpdate = runUpdate
module.exports.finishUpdate = finishUpdate
