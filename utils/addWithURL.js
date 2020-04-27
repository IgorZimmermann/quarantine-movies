const {writeFileSync, appendFileSync} = require('fs')
const getInfo = require('./getInfo')

function log(msg) {
	appendFileSync(require('path').join(__dirname, '../logs.log'), `[${new Date()}] ~ ` + msg + '\n');
}

async function main() {
  let s = require('../storage.json')
  const reqBody = {
    title: process.argv[3],
    date: process.argv[4],
    color: process.argv[5],
    url: process.argv[2]
  }
  console.log(reqBody)
  let data = await getInfo(reqBody);
  let m = process.argv[6]
  let d = process.argv[7]
  s[m].days[d] = data;
  writeFileSync(require('path').join(__dirname , '../storage.json'), JSON.stringify(s));
  log('Added: ' + data.title);
}

main()