# google-scholar #

nodejs module for searching google scholar


## getting started ##

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

## new in v1.5.0: `scholar.all` ##

If you would prefer to get all results at once rather than paginated, you can use scholar.all rather than scholar.search to retrieve all of the results. as in: 

```
'use strict'

let scholar = require('google-scholar')

scholar.all('chairmouse')
  .then(resultsObj => {
    console.log(resultsObj) // this will have all ~112 results
  })
```

## resultsObj ##

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
* Paging next/prev added in v1.2.0

### Example `resultsObj` for query "ChairMouse" ###

```
{
  results: [
    {
      title: 'ChairMouse: leveraging natural chair rotation for cursor navigation on large, high-resolution displays',
      url: 'http://dl.acm.org/citation.cfm?id=1979628',
      authors: [
        {
          name: 'A Endert',
          url: 'https://scholar.google.com/citations?user=_ZIAy3cAAAAJ&hl=en&oi=sra'
        }, {
          name: 'P Fiaux',
          url: ''
        }, {
          name: 'H Chung',
          url: ''
        }, {
          name: 'M Stewart',
          url: 'https://scholar.google.com/citations?user=PE1s-WgAAAAJ&hl=en&oi=sra'
        }, {
          name: 'et al.',
          url: ''
        }
      ],
      description: 'Abstract Large, high-resolution displays lead to more spatially based approaches. In such environments, the cursor (and hence the physical mouse) is the primary means of interaction. However, usability issues occur when standard mouse interaction is applied to  ...',
      citedCount: '16',
      citedUrl: 'https://scholar.google.com/scholar?cites=2800153897409878354&as_sdt=5,47&sciodt=0,47&hl=en&oe=ASCII',
      relatedUrl: 'https://scholar.google.com/scholar?q=related:UpmKQyIl3CYJ:scholar.google.com/&hl=en&oe=ASCII&as_sdt=0,47'
    },
    ...
  ],
  count: 93,
  nextUrl: 'https://scholar.google.com/scholar?start=10&q=chairmouse&hl=en&oe=ASCII&as_sdt=0,47',
  prevUrl: '',
  next: [Function],
  previous: [Function] 
}
```
