function xmlHttpGet (URL, callback) {
  var xhrRequest = new XMLHttpRequest()

  xhrRequest.open('GET', URL, true)
  xhrRequest.onreadystatechange = function () {
    if(xhrRequest.readyState === 4) {
      if(xhrRequest.status === 200) {
        callback(JSON.parse(xhrRequest.responseText))
      }
    }
  }
  xhrRequest.send()
}
function findIndex(check, arr) {
  for (var x=0; x<arr.length; x++) {
    if(check(arr[x])) {
      return x
    }
  }
  return -1
}
var Player = {
  conf: {
    autostart: true, // start first track when loaded
    autoplay: true,  // load next track automatically
  },
  audio: null,
  playlist: {
    url: '',
    el: null,
    tracks: [],
    length: 0,
    position: null,
    current: function () {
      return this.tracks[this.position]
    }
  },
  config: function (conf) {
    if (conf !== undefined) {
      Object.keys(this.conf).forEach(function (k) {
        this.conf[k] = conf[k] || this.conf[k]
      })
    }
  },
  init: function (audio, conf) {

    this.config(conf)

    var player   = this
    var playlist = this.playlist
    var conf     = this.conf

    this.audio = audio
    this.playlist.url = audio.getAttribute('data-src')
    this.playlist.el = document.createElement('ul')

    this.loadPlaylist(function () {

      audio.parentNode.append(playlist.el)

      audio.addEventListener('canplaythrough', function () {
        audio.play()
      }, true)

      if(conf.autostart) {
        player.playTrack(0)
      }
      if(conf.autoplay) {
        audio.addEventListener('ended', function () {
          if (playlist.position < playlist.length) {
            playlist.position++
            audio.setAttribute('src', playlist.current().url)
          }
        })
      }

    })
  },
  highlight: function (index) {
    var list = this.playlist.el.children
    Object.keys(list).forEach(function (li) {
      list[li].classList.remove('playing')
    })
    list[index].classList.add('playing')
  },
  playTrack: function (index) {
    this.position = index
    this.audio.setAttribute('src', this.playlist.tracks[index].url)
    this.highlight(index)
  },
  playTrackByUrl: function (url) {
    // not yet widely supported
    //var i = this.playlist.tracks.findIndex(function (x) {return x.url === url})
    var i = findIndex(function (x) {
      return x.url === url
    },
    this.playlist.tracks)
    if (i > -1) {
      this.playTrack(i)
    }
  },
  loadPlaylist: function (callback) {
    var player = this
    var setUpPlaylist = function (tracks) {

      player.playlist.tracks = tracks
      player.playlist.length = tracks.length
      player.playlist.position = 0

      for (var i=0; i<tracks.length; i++) {
        var a  = document.createElement('a')
        var li = document.createElement('li')

        a.addEventListener('click', function (ev) {
          ev.preventDefault()
          player.playTrackByUrl(ev.target.href)
        })
        a.href = tracks[i].url
        a.append(document.createTextNode(tracks[i].name));
        li.append(a)
        player.playlist.el.append(li)
      }

      callback()
    }
    xmlHttpGet(this.playlist.url, setUpPlaylist)
  },
}
