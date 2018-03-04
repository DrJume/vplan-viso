const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
  res.render('dashboard')
})

router.get('/settings', (req, res) => {
  res.send('Dashboard>Settings')
})

module.exports = router
