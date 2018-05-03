const express = require('express')

const router = express.Router()

router.get('/*', (req, res) => { // wildcard route: client side router
  res.render('dashboard')
})

module.exports = router
