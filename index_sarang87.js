// Comments by sarang87 - Works perfectly with changed classes for Cited count and Cited by for scholarResultsCallbackfunction
'use strict'

let scholar = (function () {
  let request = require('request')
  let cheerio = require('cheerio')
  let striptags = require('striptags')

  const GOOGLE_SCHOLAR_URL = 'https://scholar.google.com/scholar?q='
  const GOOGLE_SCHOLAR_URL_PREFIX = 'https://scholar.google.com'

  const ELLIPSIS_HTML_ENTITY = '&#x2026;'
  const ET_AL_NAME = 'et al.'
  const CITATION_COUNT_PREFIX = 'Cited by '
  const RELATED_ARTICLES_PREFIX = 'Related articles'
  const RESULTS_PER_PAGE = 10

  // regex with thanks to http://stackoverflow.com/a/5917250/1449799
  const RESULT_COUNT_RE = /\W*((\d+|\d{1,3}(,\d{3})*)(\.\d+)?) results/

  function scholarResultsCallback (resolve, reject) {
    return function (error, response, html) {
      if (error) {
        reject(error)
      } else if (response.statusCode !== 200) {
        reject('expected statusCode 200 on http response, but got', response.statusCode)
      } else {
        let $ = cheerio.load(html)

        let results = $('.gs_ri')
        let resultCount = 0
        let nextUrl = ''
        let prevUrl = ''
        if ($('.gs_ico_nav_next').parent().attr('href')) {
          nextUrl = GOOGLE_SCHOLAR_URL_PREFIX + $('.gs_ico_nav_next').parent().attr('href')
        }
        if ($('.gs_ico_nav_previous').parent().attr('href')) {
          prevUrl = GOOGLE_SCHOLAR_URL_PREFIX + $('.gs_ico_nav_previous').parent().attr('href')
        }

        let processedResults = []
        results.each((i, r) => {
          $(r).find('h3 span').remove()
          let title = $(r).find('h3').text().trim()
          let url = $(r).find('h3 a').attr('href')
          let authorNamesHTMLString = $(r).find('.gs_a').html()
          let etAl = false
          let etAlBegin = false
          let authors = []
          let description = $(r).find('.gs_rs').text()
          let footerLinks = $(r).find('.gs_ri .gs_fl')
          let citedCount = 0
          let citedUrl = ''
          let relatedUrl = ''
	  
          // modified code path to extract scholar url from foorerLinks[0]
          //console.log($(footerLinks[0]).html() +"\t\t***")
          let alist = []	
          $(footerLinks[0]).find('a').each(function (index, element) {
              alist.push($(element).attr('href'));
          });
          //console.log(alist[3] +"\t\txxxx\n\n")	  
          let scholar_url = alist[2]
          let related_url = alist[3]

	
          if ($(footerLinks[0]).text().indexOf(CITATION_COUNT_PREFIX) >= 0) {
	    
            citedCount = $(footerLinks[0]).text().substr(CITATION_COUNT_PREFIX.length)
          }
          //if ($(footerLinks[2]).attr &&
          //  $(footerLinks[2]).attr('href') &&
          //  $(footerLinks[2]).attr('href').length > 0) {
	        //  console.log( $(footerLinks[2]).attr('href'))
          //  citedUrl = GOOGLE_SCHOLAR_URL_PREFIX + $(footerLinks[2]).attr('href')
          //}
          citedUrl = GOOGLE_SCHOLAR_URL_PREFIX + scholar_url
	        relatedUrl = GOOGLE_SCHOLAR_URL_PREFIX + related_url
          if (footerLinks &&
            footerLinks.length &&
            footerLinks.length > 0) {
            if ($(footerLinks[0]).text &&
              $(footerLinks[0]).text().indexOf(CITATION_COUNT_PREFIX) >= 0) {
	            //console.log("Length:" + $(footerLinks[0]).text().split(/(\s+)/)[6])
              citedCount = $(footerLinks[0]).text().split(/(\s+)/)[6]
            }

            //if ($(footerLinks[1]).text &&
            //  $(footerLinks[1]).text().indexOf(RELATED_ARTICLES_PREFIX) >= 0 &&
            //  $(footerLinks[1]).attr &&
            //  $(footerLinks[1]).attr('href') &&
            //  $(footerLinks[1]).attr('href').length > 0) {
            //  relatedUrl = GOOGLE_SCHOLAR_URL_PREFIX + $(footerLinks[1]).attr('href')
           // }
          }
          if (authorNamesHTMLString) {
            let cleanString = authorNamesHTMLString.substr(0, authorNamesHTMLString.indexOf(' - '))
            if (cleanString.substr(cleanString.length - ELLIPSIS_HTML_ENTITY.length) === ELLIPSIS_HTML_ENTITY) {
              etAl = true
              cleanString = cleanString.substr(0, cleanString.length - ELLIPSIS_HTML_ENTITY.length)
            }
            if (cleanString.substr(0, ELLIPSIS_HTML_ENTITY.length) === ELLIPSIS_HTML_ENTITY) {
              etAlBegin = true
              cleanString = cleanString.substr(ELLIPSIS_HTML_ENTITY.length + 2)
            }
            let htmlAuthorNames = cleanString.split(', ')
            if (etAl) {
              htmlAuthorNames.push(ET_AL_NAME)
            }
            if (etAlBegin) {
              htmlAuthorNames.unshift(ET_AL_NAME)
            }
            authors = htmlAuthorNames.map(name => {
              let tmp = cheerio.load(name)
              let authorObj = {
                name: '',
                url: ''
              }
              if (tmp('a').length === 0) {
                authorObj.name = striptags(name)
              } else {
                authorObj.name = tmp('a').text()
                authorObj.url = GOOGLE_SCHOLAR_URL_PREFIX + tmp('a').attr('href')
              }
              return authorObj
            })
          }

          processedResults.push({
            title: title,
            url: url,
            authors: authors,
            description: description,
            citedCount: citedCount,
            citedUrl: citedUrl,
            relatedUrl: relatedUrl
          })
        })

        let resultsCountString = $('#gs_ab_md').text()
        if (resultsCountString && resultsCountString.trim().length > 0) {
          let matches = RESULT_COUNT_RE.exec(resultsCountString)
          if (matches && matches.length > 0) {
            resultCount = parseInt(matches[1].replace(/,/g, ''))
          } else {
            resultCount = processedResults.length
          }
        } else {
          resultCount = processedResults.length
        }

        resolve({
          results: processedResults,
          count: resultCount,
          nextUrl: nextUrl,
          prevUrl: prevUrl,
          next: function () {
            let p = new Promise(function (resolve, reject) {
              request(nextUrl, scholarResultsCallback(resolve, reject))
            })
            return p
          },
          previous: function () {
            let p = new Promise(function (resolve, reject) {
              request(prevUrl, scholarResultsCallback(resolve, reject))
            })
            return p
          }
        })
      }
    }
  }

  function search (query) {
    let p = new Promise(function (resolve, reject) {
      request(encodeURI(GOOGLE_SCHOLAR_URL + query), scholarResultsCallback(resolve, reject))
    })
    return p
  }

  function all (query) {
    return search(query)
      .then(resultsObj => {
        //  eg n=111 but i have 10 already so 101 remain,
        let remainingResultsCount = resultsObj.count - resultsObj.results.length
        if (remainingResultsCount > 0) {
          //  pr = 10
          let pagesRemaining = remainingResultsCount / RESULTS_PER_PAGE
          let pageNumbers = []
          for (var i = 1; i <= pagesRemaining + 1; i++) {
            pageNumbers.push(i)
          }
          return Promise.all(pageNumbers.map(i => {
            return search(query + '&start=' + i * RESULTS_PER_PAGE)
              .then(laterPagesResultsObj => {
                return laterPagesResultsObj.results
              })
          }))
            .then(remainingResultsArr => {
              let allResults = resultsObj.results.concat(remainingResultsArr.reduce((a, b) => a.concat(b)))
              resultsObj.results = allResults
              resultsObj.nextUrl = null
              resultsObj.next = null
              resultsObj.prevUrl = null
              resultsObj.prev = null
              return resultsObj
            })
        }
      })
  }


  return {
    search: search,
    all: all
  }
})()

module.exports = scholar
