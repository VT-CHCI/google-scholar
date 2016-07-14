# google-scholar
nodejs module for searching google scholar


## getting started

1. `npm install google-scholar --save`
1. require the module `let scholar = require('google-scholar')`
1. get searching!
```
'use strict'

let scholar = require('google-scholar')

scholar.search('chairmouse')
  .then(resultsObj => {
    console.log(resultsObj)
  })
```

## resultsObj

the results obj has 4 fields:

* `count`: the approximate number of results Google Scholar found for your query
* `results`: an array of result objects
    - the `result` abject has several fields:
        - `title`
        - `url`
        - `authors`
        - `description`
        - `citedCount`
        - `citedUrl`
        - `relatedUrl`
* `nextUrl`: the URL for the next set of results from google scholar
* `prevUrl`: the URL for the previous set of results from google scholar
* `next`: function that returns a promise which will resolve to a `resultsObj` containing the next results
* `previous`: function that returns a promise which will resolve to a `resultsObj` containing the previous results
* <del>actually paging next/prev is not yet supported</del> - added in v1.2.0