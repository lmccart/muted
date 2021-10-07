let chap = -1;
let captionsOn = true;
let fadeTimeout;
let ended = false;

resize();
window.addEventListener('resize', () => {
  resize();
});

$('#start').on('click', start);
$('#prev').on('click', playPrev);
$('#next').on('click', playNext);
$('.chap-button').on('click', playChapter);
$('#toggleCaptions').on('click', toggleCaptions);
$('#audio')[0].addEventListener('timeupdate', checkCues, false); 
$('#audio')[0].addEventListener('ended', () => {
  if (chap < 4) playNext();
  else {
    ended = true;
    showCredits();
    setTimeout(restart, 60*1000);
  }
}, false); 

$('#show-web').click(showWeb);
$('#show-transcript').click(showTranscript);
$('#show-credits').click(showCredits);
// $('body').keypress(e => {
//   if (e.key === 'p') {
//     $('#audio')[0].pause();
//   } else if (e.key === 'P') {
//     $('#audio')[0].play();
//   }
// });

function resize() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  let aspect = window.innerWidth/window.innerHeight;
  if (aspect < 0.5 || window.innerWidth < 400) {
    $('#chap0').text('Mar');
    $('#chap1').text('Jun');
    $('#chap2').text('Sep');
    $('#chap3').text('Dec');
    $('#chap4').text('Jul');

  }
}

function restart() {
  ended = false;
  showWeb();
  reset();
  $('body').css('background', chapters[chapters.length-1].background);
  chap = -1;
  $('#text-container').addClass('join');
  $('#start').show();
  $('.info').show();
  $('#nav-right').css('display', 'none');
  $('#nav-left').css('display', 'none');
}

function start() {
  $('#text-container').removeClass('join');
  $('#start').hide();
  $('.info').hide();
  $('#nav-right').css('display', 'inline-block');
  $('#nav-left').css('display', 'inline-block');
  playNext();
  $('body').on('mousemove', showNav);
  // setTimeout(() => {
  // }, 2000);
}

function toggleCaptions() {
  captionsOn = !captionsOn;
  $('#toggleCaptions').toggleClass('on');
  if (!captionsOn) {
    hideCaption();
  }
}

function playPrev() {
  reset();
  chap--;
  if (chap >= 0) playChapter(chap);
}

function playNext() {
  reset();
  chap++;
  if (chap < 5) playChapter(chap);
}

function reset() {
  pause();
  $('#image').hide();
  $('#text').hide();
  $('#description').hide();
  $('#toggleCaptions').hide();
  $('body').removeClass('white-fade');
  $('#text-container').removeClass('small');
  $('#description-container').removeClass('small');
  if (chap > -1) {
    let cues = chapters[chap].transcript;
    for (let c of cues) {
      c[4] = false;
    }
  }
}

function playChapter(n) {
  if (typeof n === 'object') {
    reset();
    chap = Number(n.target.id.substring(4));
  }

  console.log(`playing chapter #chap${chap}`)
  updateNav();

  $('body').css('background', chapters[chap].background);
  $('#text, nav, .chap-button, .text-button, .arrow-button').css('color', chapters[chap].color);
  if (chapters[chap].image) {
    $('#image').attr('src', chapters[chap].image);
    $('#image').on('load', displayImage);
  } else {
    $('#image').css('opacity', 0);
  }
  $('#audio').attr('src', chapters[chap].audio);
  play();

  if (chap === 4) {
    $('body').addClass('white-fade');
  } else {
    $('body').removeClass('white-fade');
  }
}

function updateNav() {
  $('#prev').css('visibility', `${chap === 0 ? 'hidden' : 'visible'}`);
  $('#next').css('visibility', `${chap === 4 ? 'hidden' : 'visible'}`);
  $('.chap-button').css('visibility', 'visible');
  $('.chap-button').removeClass('current');
  $(`#chap${chap}`).addClass('current');
}


function checkCues(e) {
  if (chap < 0) return;
  let t = e.target.currentTime;
  let cues = chapters[chap].transcript;
  for (let c of cues) {
    if (t >= c[0] && !c[4]) {
      if (c[3] || captionsOn) {
        c[4] = true;
        displayCaption(c[1], c[2]);
      } else {
        hideCaption(c[2]);
      }
    }
  }

  if (chapters[chap].image_cue) { // show image
    if (t  >= chapters[chap].image_cue[0] && t < chapters[chap].image_cue[1] && $('#image').is(':hidden')) {
      $('#image').show();
      $('#text-container').addClass('small');
      $('#description-container').addClass('small');
    } else if ((t < chapters[chap].image_cue[0] || t >= chapters[chap].image_cue[1]) && $('#image').is(':visible')) {
      $('#image').hide();
      $('#text-container').removeClass('small');
      $('#description-container').removeClass('small');
    }
  }
}

function displayCaption(text, description) {
  if (text.includes('[FLASH]')) {
    $('body').css('background', '#c01903');
    setTimeout(() => { $('body').css('background', chapters[chap].background); }, 150);
  } else if (text.includes('[HA]')) {
    for (let i = 0; i < description; i+=2) {
      console.log(i);
      setTimeout(() => { $('body').css('background', '#ff2b00'); }, i * 100 + Math.random() * 60 - 30);
      setTimeout(() => { $('body').css('background', chapters[chap].background); }, (i+1) * 100 + Math.random() * 60 - 30);
    }
  } else if (description) {
    $('#description').html(text);
    $('#description').show();

  } else {
    $('#text').html(text);
    $('#text').show();
  }
}

function hideCaption(description) {
  if (description) {
    $('#description').hide();

  } else {
    $('#text').hide();
  }
}

function displayImage() {
  if (chap === 3) { // sleepover sizing
    let w = $('#image').width();
    let h = $('#image').height();
    let ww = window.innerWidth;
    let wh = window.innerHeight;
    console.log($('#image'))
    console.log(w, h, ww, wh);
    if (w/h > ww/wh) {
      $('#image').height('100%');
    } else {
      $('#image').width('100%');
    }
    $('#image').css('max-width', '400%');
    $('#image').css('max-height', '400%');
  } else {
    $('#image').css('max-width', '75%');
    $('#image').css('max-height', '70%');
    $('#image').width('auto');
    $('#image').height('auto');
  }
  $('#image').css('opacity', 1);
}


function showNav() {
  $('#main-nav').stop(true, true).fadeTo(300, 1.0);
  if (fadeTimeout) clearTimeout(fadeTimeout);
  if ($('#web-container').is(':visible')) {
    fadeTimeout = setTimeout(() => {
      $('#main-nav').stop(true, true).fadeTo(300, 0.1);
    }, 2000);
  }
}

function play() {
  $('#audio')[0].play();
  // $('#show-web').text('Pause');
}
function pause() {
  $('#audio')[0].pause();
  // $('#show-web').text('Play');
}

function showWeb() {
  if (ended) restart();
  else {
    console.log($('#show-web').text())
    // if ($('#show-web').text() === 'Play') {
      play();
      $('#web-container').css('display', 'flex');
      $('#transcript-container').hide();
      $('#credits-container').hide();
      $('#nav-left').show();
      $('.text-button').removeClass('current');
      $('#show-web').addClass('current');
      $('#text, nav, .chap-button, .text-button, .arrow-button').css('color', chapters[chap].color);
    // } else {
    //   pause();
    // }
  }
}

function showTranscript() {
  pause();
  $('#web-container').hide();
  $('#transcript-container').css('display', 'block');
  $('#credits-container').hide();
  $('#nav-left').hide();
  $('.text-button').removeClass('current');
  $('#show-transcript').addClass('current');
  $('#text, nav, .chap-button, .text-button, .arrow-button').css('color', 'white');
}

function showCredits() {
  pause();
  $('#web-container').hide();
  $('#transcript-container').hide();
  $('#credits-container').css('display', 'block');
  $('#nav-left').hide();
  $('.text-button').removeClass('current');
  $('#show-credits').addClass('current');
  $('#text, nav, .chap-button, .text-button, .arrow-button').css('color', 'white');
}