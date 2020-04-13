const express = require('express');
const app = express();
const fs = require('fs');

const request = require('request');
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
	res.send(data);
});

app.post('/add/:m/:d/', (req, res) => {
	let title = req.body.title;
	let uri = `https://hu.wikipedia.com/wiki/${encodeURI(
		title.replace(/ /g, '_')
	)}`;
	request(uri, (e, r, b) => {
		let $ = cheerio.load(b);
		if ($('h1#firstHeading').text().includes('egyértelműsítő lap')) {
			request(uri + '_(film)', (er, re, bo) => {
				let $$ = cheerio.load(bo);
				let small = $$('td.fejlec small');
				let srcTitle;
				if (small.length != 0) {
					console.log('small');
					srcTitle = small.text().replace('(', '').replace(')', '');
				} else {
					srcTitle = $$('td.fejlec').text().replace('(', '').replace(')', '');
				}
				res.send(srcTitle);
			});
		} else {
			let small = $('td.fejlec small');
			let srcTitle;
			if (small) {
				srcTitle = small.text().replace('(', '').replace(')', '');
			} else {
				srcTitle = $('td.fejlec').text().replace('(', '').replace(')', '');
			}
			res.send(srcTitle);
		}
	});
});

app.listen(1919, () => {
	console.log('App listening on PORT 1919...');
});
