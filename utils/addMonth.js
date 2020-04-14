const { readFileSync, writeFileSync } = require('fs');
const path = require('path');
let s = JSON.parse(readFileSync(path.dirname(__dirname) + '\\storage.json'));

s[process.argv[2]] = {
	display: process.argv[3],
	number: process.argv[4],
	days: {},
};

for (var i = 0; i < process.argv[5]; i++) {
	s[process.argv[2]].days[i + 1] = {};
}

writeFileSync(path.dirname(__dirname) + '\\storage.json', JSON.stringify(s));
