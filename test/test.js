'use strict'

let expect = require('chai').expect
let scholar = require('../index.js')

describe('Google Scholar Searcher', () => {
  describe('Google Scholar search', () => {
    it('gets a resultsObj for query, and the obj has the right properties',
      (done) => {
        // should test with queries i expect to get different kinds of results,
        // as well as queries i expect to have no results
        scholar.search('askdgfk')
          .then(resultsObj => {
            done()
            expect(resultsObj).to.have.property('count')
            expect(resultsObj).to.have.property('nextUrl')
            expect(resultsObj).to.have.property('prevUrl')
            expect(resultsObj).to.have.property('next')
            expect(resultsObj).to.have.property('previous')
            expect(resultsObj).to.have.property('results')
            if (resultsObj.count > 0) {
              expects(resultsObj.results).to.have.property('length')
              expects(resultsObj.results.length).to.be.above(0)
            }
          })
        expect(1).to.equal(1)
      })
  })
})
