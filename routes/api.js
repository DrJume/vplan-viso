const express = require('express')

const router = express.Router()

// middleware that is specific to this router
router.use((req, res, next) => {
  // log.info('Time: ', Date.now())
  next()
})

router.get('/', (req, res) => {
  res.send('GET API')
})
router.post('/', (req, res) => {
  res.send('POST API')
})

router.get('/test', (req, res) => {
  res.send('API>TEST')
})

module.exports = router
