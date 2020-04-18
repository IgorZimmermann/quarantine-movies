const express = require('express');
const app = express();
const fs = require('fs');

const getInfo = require('./utils/getInfo');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'pug');
app.use('/p/', express.static(__dirname + '/public/'));
app.set('views', __dirname + '/views/');

const config = require('./config.json');
app.locals.config = config;

function log(msg) {
	fs.appendFileSync(__dirname + '/logs.log', `[${new Date()}] ~ ` + msg);
}

app.use((req, res, next) => {
	log(`${req.method} ${req.url} from ${req.ip}\n`);
	next();
});

app.get('/', (req, res) => {
	let s = JSON.parse(fs.readFileSync(__dirname + '/storage.json'));
	res.render('index', {
		s: s,
	});
});

app.get('/add/:m/:d/', (req, res) => {
	let s = JSON.parse(fs.readFileSync(__dirname + '/storage.json'));
	res.render('add', {
		m: req.params.m,
		month: s[req.params.m].number,
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
	let data = await getInfo(req.body);
	if (typeof data != 'object') {
		log(data);
		return res.redirect('/');
	}
	s[req.params.m].days[req.params.d] = data;
	fs.writeFileSync(__dirname + '/storage.json', JSON.stringify(s));
	res.redirect('/');
	log('Added: ' + req.body.title);
});

app.get('/readd/:m/:d/', async (req, res) => {
	let s = JSON.parse(fs.readFileSync(__dirname + '/storage.json'));
	let query = s[req.params.m].days[req.params.d];
	let data = await getInfo({
		title: query.title,
		date: query.released,
		color: query.color,
	});
	if (typeof data != 'object') {
		log(data);
		return res.redirect('/');
	}
	s[req.params.m].days[req.params.d] = data;
	fs.writeFileSync(__dirname + '/storage.json', JSON.stringify(s));
	res.redirect('/');
	log('Readded: ' + query.title);
});

app.listen(1919, () => {
	console.log('App listening on PORT 1919...');
});
