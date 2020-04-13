const express = require('express');
const app = express();
const fs = require('fs');

const superagent = require('superagent');
const cheerio = require('cheerio');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'pug');
app.use('/p/', express.static(__dirname + '/public/'));
app.set('views', __dirname + '/views/');

app.get('/', (req, res) => {
	let s = require('./storage.json');
	res.render('index', {
		s: s,
	});
});

app.get('/add/:m/:d/', (req, res) => {
	res.render('add', {
		m: req.params.m,
		d: req.params.d,
	});
});

app.get('/movie/:m/:d/', (req, res) => {
	let s = require('./storage.json');
	let data = s[req.params.m].days[req.params.d];
	res.render('movie', {
		d: data,
		month: s[req.params.m].number,
		day: req.params.d,
	});
});

app.post('/add/:m/:d/', async (req, res) => {
	let s = require('./storage.json');
	let title = req.body.title;
	s[req.params.m].days[req.params.d].title = title;
	fs.writeFileSync(__dirname + '/storage.json', JSON.stringify(s));
	res.redirect('/');
	let uri = `https://hu.wikipedia.com/wiki/${encodeURI(
		title.replace(/ /g, '_')
	)}`;
	let body;
	try {
		body = await superagent.get(uri);
	} catch (e) {
		return console.log("Can't find movie on wikipedia");
	}
	let $ = cheerio.load(body.text);
	if ($('#firstHeading').text().includes('egyértelműsítő')) {
		try {
			body = await superagent.get(uri + '_(film)');
		} catch (e) {
			body = await superagent.get(`${uri}_(film, ${req.body.date})`);
		}
		$ = cheerio.load(body.text);
	}
	let srcTitle;
	let small = $('.fejlec small');
	if (small) {
		srcTitle = small.text().replace('(', '').replace(')', '');
	} else {
		srcTitle = $('.fejlec').text();
	}
	uri = `https://imdb.com/find?q=${encodeURI(srcTitle)}`;
	body = await superagent.get(uri);
	$ = cheerio.load(body.text);
	uri =
		'https://imdb.com' +
		$('.findResult:first-of-type .result_text a').attr('href');
	body = await superagent.get(uri);
	$ = cheerio.load(body.text);
	let data = {
		title: title,
		directors: [],
		writers: [],
		stars: [],
		trailer: 'https://imdb.com' + $("a[data-type='recommends']").attr('href'),
		cover: $('.poster img').attr('src'),
		released: $(".subtext a[title='See more release dates']")
			.text()
			.replace(/(?:\n)/g, ''),
		length: $('.subtext time').text().replace(/\s+/g, ''),
		rating: $("span[itemprop='ratingValue']").text(),
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
			data.directors.push(d);
		});
	creditArray
		.eq(1)
		.find('a')
		.each((i, e) => {
			let d = {
				name: $(e).text(),
				imdb: 'https://imdb.com' + $(e).attr('href').split('?')[0],
			};
			data.writers.push(d);
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
			data.stars.push(d);
		});
	s[req.params.m].days[req.params.d] = data;
	fs.writeFileSync(__dirname + '/storage.json', JSON.stringify(s));
});

app.listen(1919, () => {
	console.log('App listening on PORT 1919...');
});
