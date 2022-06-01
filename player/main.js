let button = document.querySelector('#button');
let audio = document.querySelector('#audio');
let video = document.querySelector('#video');

$(document).ready(() => {
  $(window).on('load', load);
  $('#instruct').on('click touchstart', restart);
  $('#video').on('ended', load);

});

function load() {
  $('#instruct').show();
}

function restart() {
  console.log('restart');
  if (audio) {
    if (audio.paused) {
      audio.play();
    } else {
      audio.currentTime = 0
    }
    console.log("restart audio")
  } else if (video) {
    console.log("restart video")
    $('#instruct').hide();
    if (video.paused) {
      video.play();
    } else {
      video.pause();
      $('#video').fadeOut(1000, () => {
        video.currentTime = 0;
        $('#video').fadeIn(1000, () => {
          video.play();
        })
      });
    }
  }
}