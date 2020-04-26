const puppeteer = require('puppeteer')

module.exports = async (reqBody) => {
  const browser = await (await puppeteer.launch({executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'}))
  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0')
  let href = `https://www.hbogo.hu/search/${reqBody.title.toLowerCase().replace(/ /g, "-")}`.replace(/á/g, 'a').replace(/é/g, 'e').replace(/[óö]/g, 'o').replace(/í/g, 'i').replace(/[úű]/g, 'u')
  await page.goto(encodeURI(href))
  await page.waitFor(1000)
  let movHREF = await page.evaluate(() => document.querySelectorAll('.search-item a')[0].getAttribute('href'))
  await browser.close()
  return `https://hbogo.hu${movHREF}`
}