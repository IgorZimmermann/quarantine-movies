const puppeteer = require('puppeteer')

module.exports = ($) => {
  let splitSRC = $('.poster img').attr('src').split('@')
  splitSRC[splitSRC.length - 1] = '._V1_SY1000_CR0,0,686,1000_AL_.jpg'
  return splitSRC.join('@')
}