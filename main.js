const express = require('express');
const app = express();

app.set('view engine', 'pug');
app.use('/p/', express.static(__dirname + '/public/'));
app.set('views', __dirname + '/views/');

app.get('/', (req, res) => {
	res.render('index');
});

app.listen(1919, () => {
	console.log('App listening on PORT 1919...');
});
