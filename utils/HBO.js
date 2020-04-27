const puppeteer = require('puppeteer')

module.exports = async (reqBody) => {
  const browser = await (await puppeteer.launch({executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'}))
  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0')
  await page.goto('https://hbogo.hu/search/')
  await page.type('#search-input', reqBody.title)
  await page.waitFor(1000)
  let movHREF
  try {
    let relHREF = await page.evaluate(() => document.querySelectorAll('.search-item a')[0].getAttribute('href'))
    movHREF = "https://hbogo.hu"+relHREF
  } catch (e) {
    movHREF = null
  }
  browser.close()
  return movHREF
}