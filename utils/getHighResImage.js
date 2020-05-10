const puppeteer = require('puppeteer')

module.exports = async (reqBody) => {
  const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' })
  const page = await browser.newPage()
  await page.goto(`https://www.google.com/search?q=${encodeURI(reqBody.title).replace(/%20/g, '+')}+${reqBody.date}+poster&ijn=0&tbm=isch&tbs=isz%3Al%2Ciar%3At`)
  await page.waitForSelector('[data-ri="0"] a:nth-child(1)')
  await page.click('[data-ri="0"] a:nth-child(1)');
  let src = await page.evaluate(() => document.querySelector('[data-ri="0"] a:nth-child(1)').getAttribute('href'))
  await browser.close()
  return decodeURIComponent(src.replace('/imgres?imgurl=', '').split('&')[0])
}