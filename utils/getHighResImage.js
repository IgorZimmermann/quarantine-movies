const puppeteer = require('puppeteer')

module.exports = ($) => {
  let splitSRC = $('.poster img').attr('src').split('@')
  splitSRC[splitSRC.length - 1] = '._V1.jpg'
  return splitSRC.join('@')
}