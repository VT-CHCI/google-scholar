'use strict'

let scholar = require('./index_sarang87.js')

scholar.all('amazon redshift')
  .then(resultsObj => {
    console.log(resultsObj)
  })
