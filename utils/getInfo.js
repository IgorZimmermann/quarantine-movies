const superagent = require('superagent');
const cheerio = require('cheerio');

module.exports = async (reqBody) => {
  let uri = `https://imdb.com/find?q=${encodeURI(reqBody.title)}%20${
    reqBody.date
    }&s=tt&ttype=ft`;
  let body = await superagent.get(uri);
  let $ = cheerio.load(body.text);
  uri =
    'https://imdb.com' +
    $('.findResult:first-of-type .result_text a').attr('href');
  body = await superagent.get(uri);
  $ = cheerio.load(body.text);
  let data = {
    title: reqBody.title,
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
      data.directors.push(d);
    });
  creditArray
    .eq(1)
    .find('a')
    .each((i, e) => {
      if ($(e).text().includes('more credits')) return;
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

  return data
}