'use strict'

let expect = require('chai').expect
let scholar = require('../index.js')

describe('Google Scholar Searcher', () => {
  describe('Google Scholar search', () => {
    it('gets a resultsObj for query, and the obj has the right properties',
      done => {
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
          .catch(err => {
            done(err)
            // console.log('should have had a friggin catch block!')
            // console.log(err)
          })
        expect(1).to.equal(1)
      })

    it('does SOMETHING for long query', done => {
      scholar.search('Children\'s use of the Yahooligans! Web search engine: I. Cognitive, physical, and affective behaviors on fact‐based search tasks')
          .then(resultsObj => {
            done()
            expect(resultsObj).to.exist
          })
          .catch(err => {
            done(err)
            // console.log('err')
            // console.log(err)
          })
    })
    it('does SOMETHING for bad(?) query', done => {
      scholar.search('&cites=2800153897409878354')
          .then(resultsObj => {
            done()
            expect(resultsObj).to.exist
          })
          .catch(err => {
            done(err)
            // console.log(err)
          })
    })
    it('does rate limits correctly', function(done) {
      var queries = []
      var queryCount = 20
      this.timeout(60000)
      for (var i=0; i<queryCount; i++) {
        queries.push(i)
      }
      Promise.all(queries.map(query => {
        return scholar.search(query)
      }))
        .then(resultsObjList => {
          console.log(resultsObjList)
          expect(resultsObjList).to.have.lengthOf(queryCount)
          done()
        })
        .catch(err => {
          done(err)
          // console.log(err)
        })
    })
  })
})
