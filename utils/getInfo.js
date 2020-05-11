const superagent = require('superagent');
const cheerio = require('cheerio');

const getHighResImage = require('./getHighResImage');
const getTrailer = require('./getTrailer');
const HBO = require('./HBO')

module.exports = async (reqBody) => {
	let uri
	if (reqBody.url) {
		uri = reqBody.url
	} else {
		uri = `https://imdb.com/find?q=${encodeURI(reqBody.title)}%20${
			reqBody.date
		}&s=tt&ttype=ft`;
		let body = await superagent.get(uri);
		let $ = cheerio.load(body.text);
		let firstResult = $('.findResult:first-of-type .result_text a').attr('href');
		if (!firstResult) {
			return 'No result with URL: ' + uri;
		}
		uri = 'https://imdb.com' + firstResult;
	}
	body = await superagent.get(uri);
	$ = cheerio.load(body.text);
	uri2 = uri.split('?')[0] + 'fullcredits'
	body2 = await superagent.get(uri2)
	$2 = cheerio.load(body2.text)
	let data = {
		title: reqBody.title,
		cast: {
			directors: [],
			writers: [],
			stars: [],
			music: [],
			cinematography: []
		},
		trailer: await getTrailer(reqBody),
		cover: 	getHighResImage($),
		released: $('#titleDetails .txt-block:nth-child(6)').text().split(' (')[0].split(': ')[1].split(' ')[2],
		hbo: await HBO(reqBody),
		length: $('.subtext time').text().replace(/\s+/g, ''),
		rating: $("span[itemprop='ratingValue']").text(),
		color: reqBody.color,
	};
	let creditArray = $('.credit_summary_item');
	creditArray
		.eq(0)
		.find('a')
		.each((i, e) => {
			let d = {
				name: $(e).text(),
				imdb: 'https://imdb.com' + $(e).attr('href').split('?')[0],
			};
			data.cast.directors.push(d);
		});
	creditArray
		.eq(1)
		.find('a')
		.each((i, e) => {
			if ($(e).text().includes('more credit')) return;
			let d = {
				name: $(e).text(),
				imdb: 'https://imdb.com' + $(e).attr('href').split('?')[0],
			};
			data.cast.writers.push(d);
		});
	creditArray
		.eq(2)
		.find('a')
		.each((i, e) => {
			if ($(e).text() == 'See full cast & crew') return;
			let d = {
				name: $(e).text(),
				imdb: 'https://imdb.com' + $(e).attr('href').split('?')[0],
			};
			data.cast.stars.push(d);
		});
	let castArray = $2('.simpleTable.simpleCreditsTable')
	castArray
		.eq(3)
		.find('td.name')
		.each((i, e) => {
			let d = {
				name: $(e).find('a').text(),
				imdb: $(e).find('a').attr('href').split('?')[0]
			}
			data.cast.music.push(d)
		})
	castArray
		.eq(4)
		.find('td.name')
		.each((i, e) => {
			let d = {
				name: $(e).find('a').text(),
				imdb: $(e).find('a').attr('href').split('?')[0]
			}
			data.cast.cinematography.push(d)
		})

	return data;
};
