//TODO: make playlist shuffle
function Sound() {
    var soundDir = "assets/sound/";
    var musicDir = "assets/music/";
    var tracksNum = 14;
    var firstTrackId = 1;
    var trackId = firstTrackId;

    var lastTrackLsKey = "last-track";
    function loadLastTrack() {
        return +localStorage.getItem(lastTrackLsKey) || firstTrackId;
    };

    function saveLastTrack() {
        localStorage.setItem(lastTrackLsKey, trackId);
    };


    var volume = 0.3;
    var currentTrack = null;
    var nextTrack = null;

    this.track = null;
    this.sounds = {};

    var sounds = ["beep.ogg", "chop.webm", "lvl-up.ogg", "eat.ogg", "xp.ogg", "heal.ogg"];
    sounds.forEach(function(name) {
        var audio =  new Audio(soundDir + name);
        name = name.split(".").slice(0, -1).join("."); // name without extension
        this.sounds[name] = audio;
    }.bind(this));

    this.init = function() {
        trackId = loadLastTrack();
        if (document.location.hash.indexOf("mute") != -1) {
            game.config.sound.playMusic = false;
            game.config.sound.playSound = false;
            return;
        }
        this.playMusic();
    };

    this.playMusic = function() {
        if (!game.config.sound.playMusic)
            return;
        nextTrack = loadTrack(trackId);
        playNextTrack();
    };

    function loadTrack(trackId) {
        return new Audio(musicDir + trackId + ".webm");
    };

    function playNextTrack() {
        currentTrack = nextTrack;
        playTrack(currentTrack);
        loadNextTrack();
    }

    function playTrack(track) {
        track.volume = volume;
        track.play();

        // track.addEventListener("ended", this.playNextTrack.bind(this));
        //BUGGED; see https://code.google.com/p/chromium/issues/detail?id=157543

        function next() {
            if (this.duration - this.currentTime < 1) {
                this.removeEventListener("timeupdate", next);
                playNextTrack();
            }
        }

        track.addEventListener("timeupdate", next);
        saveLastTrack();
    }

    function loadNextTrack() {
        if (++trackId > tracksNum) {
            trackId = firstTrackId;
        }
        nextTrack = loadTrack(trackId);
    }

    this.musicIsPlaying = function() {
        return !currentTrack.paused;
    };

    this.toggleMusic = function() {
        if (currentTrack.paused)
            currentTrack.play();
        else
            currentTrack.pause();
    };

    this.stopMusic = function() {
        currentTrack.pause();
    };

    this.playSound = function(name, repeat) {
        if (!game.config.sound.playSounds)
            return;
        this.stopSound(name);
        var sound = this.sounds[name];
        if (!sound) {
            console.warn("Sound " + name + " not found");
            return;
        }
        sound.onloadeddata = function() {
            sound.currentTime = 0;
            sound.play();
        };
        sound.load();
        if (repeat !== undefined) {
            repeat = repeat || 1000;
            sound.repeat = setTimeout(this.playSound.bind(this, name, repeat), repeat);
        }
    };

    this.stopSound = function(name) {
        var sound = this.sounds[name];
        if (!sound)
            return;
        sound.pause();
        if (sound.repeat) {
            clearTimeout(sound.repeat);
            sound.repeat = null;
        }
    };

    this.init();
}
