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
	let s = JSON.parse(fs.readFileSync(__dirname + '/storage.json'));
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
	let s = JSON.parse(fs.readFileSync(__dirname + '/storage.json'));
	let data = s[req.params.m].days[req.params.d];
	res.render('movie', {
		d: data,
		month: s[req.params.m].number,
		day: req.params.d,
	});
});

app.post('/add/:m/:d/', async (req, res) => {
	let s = JSON.parse(fs.readFileSync(__dirname + '/storage.json'));
	let title = req.body.title;
	let uri = `https://imdb.com/find?q=${encodeURI(title)}%20${
		req.body.date
	}&s=tt&ttype=ft`;
	let body = await superagent.get(uri);
	let $ = cheerio.load(body.text);
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
		color: req.body.color,
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
	res.redirect('/');
});

app.listen(1919, () => {
	console.log('App listening on PORT 1919...');
});
