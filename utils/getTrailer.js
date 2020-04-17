const puppeteer = require('puppeteer');

module.exports = async (reqBody) => {
	const browser = await puppeteer.launch({
		executablePath:
			'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
	});
	const page = await browser.newPage();
	let query = encodeURI(
		`${reqBody.title.replace(/ /g, '+')}+${reqBody.date}+előzetes`
	);
	let url = `https://www.youtube.com/results?search_query=${query}`;
	await page.goto(url);
	await page.waitFor(1000);
	let trailerURL = await page.evaluate(() =>
		document.querySelectorAll('a#thumbnail')[0].getAttribute('href')
	);
	await browser.close();
	return 'https://www.youtube.com' + trailerURL;
};
