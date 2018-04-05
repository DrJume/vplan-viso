const express = require('express')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('util/promisified-fs')

const router = express.Router()

// middleware that is specific to this router
router.use((req, res, next) => {
  // log.info('Time: ', Date.now())
  next()
})

router.get('/current', async (req, res) => {
  let err, jsonData // eslint-disable-next-line prefer-const
  [err, jsonData] = await try_(
    promiseFs.readFile('upload/current/upload.json', { encoding: 'utf-8' }),
    'FILE_READ_ERR',
  )
  if (err) {
    res.send('No upload.json in current/')
    return
  }
  res.json(JSON.parse(jsonData))
})
router.get('/next', async (req, res) => {
  let err, jsonData // eslint-disable-next-line prefer-const
  [err, jsonData] = await try_(
    promiseFs.readFile('upload/next/upload.json', { encoding: 'utf-8' }),
    'FILE_READ_ERR',
  )
  if (err) {
    res.send('No upload.json in next/')
    return
  }
  res.json(JSON.parse(jsonData))
})

router.post('/', (req, res) => {
  res.send('POST API')
})

router.get('/test', (req, res) => {
  res.send('API>TEST')
})

module.exports = router
