const express = require('express')

const try_ = require('helpers/try-wrapper')
const promiseFs = require('helpers/promisified-fs')

const router = express.Router()

// middleware that is specific to this router
router.use((req, res, next) => {
  // log.info('Time: ', Date.now())
  next()
})

router.get('/heute', async (req, res) => {
  let err, jsonData // eslint-disable-next-line prefer-const
  [err, jsonData] = await try_(
    promiseFs.readFile('upload/heute/upload.json', { encoding: 'utf-8' }),
    { logLabel: 'FILE_READ_ERR' },
  )
  if (err) {
    res.send('No upload.json in heute/')
    return
  }
  res.json(JSON.parse(jsonData))
})
router.get('/morgen', async (req, res) => {
  let err, jsonData // eslint-disable-next-line prefer-const
  [err, jsonData] = await try_(
    promiseFs.readFile('upload/morgen/upload.json', { encoding: 'utf-8' }),
    { logLabel: 'FILE_READ_ERR' },
  )
  if (err) {
    res.send('No upload.json in morgen/')
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
