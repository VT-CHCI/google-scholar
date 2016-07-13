'use strict'

let scholar = (function () {
  let request = require('request')
  let cheerio = require('cheerio')
  let striptags = require('striptags')

  const GOOGLE_SCHOLAR_URL = 'https://scholar.google.com/scholar?q='

  const ELLIPSIS_HTML_ENTITY = '&#x2026;'
  const ET_AL_NAME = 'et al.'
  const CITATION_COUNT_PREFIX = 'Cited by '
  const RELATED_ARTICLES_PREFIX = 'Related articles'
  const RESULT_COUNT_RE = /.+ (\d+) results/

  function search (query) {
    let p = new Promise(function (resolve, reject) {
      request(GOOGLE_SCHOLAR_URL + query, function (error, response, html) {
        if (error) {
          reject(error)
        }
        if (!error && response.statusCode === 200) {
          let $ = cheerio.load(html)

          let results = $('.gs_r')
          let resultCount = 0
          let nextUrl = ''
          if ($('.gs_ico_nav_next').parent().attr('href')) {
            nextUrl = $('.gs_ico_nav_next').parent().attr('href')
          }

          let processedResults = results.map((i, r) => {
            let title = $(r).find('h3').text()
            let url = $(r).find('h3 a').attr('href')
            let authorNamesHTMLString = $(r).find('.gs_a').html()
            let etAl = false
            let etAlBegin = false
            let authors = []
            let description = striptags($(r).find('.gs_rs').html(), ['b'])
            let footerLinks = $(r).find('.gs_ri .gs_fl a')
            let citedCount = 0
            let citedUrl = ''
            let relatedUrl = ''

            let resultsCountString = $('#gs_ab_md').text()
            resultCount = RESULT_COUNT_RE.exec(resultsCountString)

            if ($(footerLinks[0]).text().indexOf(CITATION_COUNT_PREFIX) >= 0) {
              citedCount = $(footerLinks[0]).text().substr(CITATION_COUNT_PREFIX.length)
            }
            if ($(footerLinks[0]).attr &&
              $(footerLinks[0]).attr('href') &&
              $(footerLinks[0]).attr('href').length > 0) {
              citedUrl = $(footerLinks[0]).attr('href')
            }
            if (footerLinks &&
              footerLinks.length &&
              footerLinks.length > 0) {
              if ($(footerLinks[0]).text &&
                $(footerLinks[0]).text().indexOf(CITATION_COUNT_PREFIX) >= 0) {
                citedCount = $(footerLinks[0]).text().substr(CITATION_COUNT_PREFIX.length)
              }

              if ($(footerLinks[1]).text &&
                $(footerLinks[1]).text().indexOf(RELATED_ARTICLES_PREFIX) >= 0 &&
                $(footerLinks[1]).attr &&
                $(footerLinks[1]).attr('href') &&
                $(footerLinks[1]).attr('href').length > 0) {
                relatedUrl = $(footerLinks[1]).attr('href')
              }
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
                  authorObj.url = tmp('a').attr('href')
                }
                return authorObj
              })
            }

            return {
              title: title,
              url: url,
              authors: authors,
              description: description,
              citedCount: citedCount,
              citedUrl: citedUrl,
              relatedUrl: relatedUrl
            }
          })
          resolve({
            results: processedResults,
            count: resultCount,
            nextUrl: nextUrl
          })
        }
      })
    })

    return p
  }

  return {
    search: search
  }
})()

module.exports = scholar
