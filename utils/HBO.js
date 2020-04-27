const puppeteer = require('puppeteer')

module.exports = async (reqBody) => {
  const browser = await (await puppeteer.launch({executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'}))
  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0')
  await page.goto('https://hbogo.hu/search/')
  await page.type('#search-input', reqBody.title)
  await page.waitFor(1000)
  let movHREF = await page.evaluate(() => document.querySelectorAll('.search-item a')[0].getAttribute('href'))
  await page.goto("https://hbogo.hu"+movHREF)
  await page.waitFor(1000)
  let isValid = await page.evaluate((reqBody) => {
    let metaArray = document.querySelectorAll('.meta')[0].textContent.split('|')
    if (metaArray[0].replace(/[A-Z]| /g, '') == reqBody.date) {
      return true
    }
  }, reqBody)
  if (isValid) {
    return movHREF
  }
}