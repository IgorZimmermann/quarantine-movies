$(() => {
  let date = new Date()
  let id
  if (date.getMonth().toString().length == 1) {
    id = `#mov0${date.getMonth() + 1}${date.getDate()}`
  }

  var offset = $(id).offset();
  offset.top -= 10;
  $('html, body').animate({
    scrollTop: offset.top,
    scrollLeft: offset.left
  });
})