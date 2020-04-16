const { writeFileSync } = require('fs')
const getInfo = require('./getInfo')

let s = require('../storage.json');
Object.keys(s).forEach(m => {
  Object.keys(s[m].days).forEach(d => {
    let data = s[m].days[d]
    getInfo({ title: data.title, date: data.released, color: data.color })
  })
})

writeFileSync(require.resolve("../storage.json"), JSON.stringify(s))