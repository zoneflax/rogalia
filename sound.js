function Sound() {
    var soundDir = "assets/sound/";
    var musicDir = "assets/music/";
    var tracks = [
        "silk-way.webm",
        "dawn.webm",
        "rain-from-the-night-sky.webm",
        "celtic-forest.webm",
        "aquarel.webm",
    ]
    this.volume = 0.3;
    this.tracks = [];
    this.sounds = [];
    if (document.location.hash.indexOf("mute") != -1) {
        game.config.sound.playMusic = false;
        game.config.sound.playSound = false;
        return;
    }
    this.tracks = tracks.map(function(name) {
        var audio = new Audio(musicDir + name);
        audio.addEventListener('ended', function(e) {
            this.playMusic();
        }.bind(this));

        return audio;
    }.bind(this));

    var sounds = ["beep.ogg", "chop.webm", "lvl-up.ogg", "eat.ogg", "xp.ogg"];
    sounds.forEach(function(name) {
        var audio =  new Audio(soundDir + name);
        name = name.split(".").slice(0, -1).join(".");
        this.sounds[name] = audio;
    }.bind(this));
}

Sound.prototype = {
    trackIndex: 0,
    track: null,
    tracks: [],
    sounds: {},
    playMusic: function() {
        if (!game.config.sound.playMusic)
            return;

        if (this.track == null || ++this.trackIndex >= this.tracks.length) {
            this.trackIndex = 0;
        }

        this.track = this.tracks[this.trackIndex];
        if (this.track.played.length > 0) {
            this.track.load();
        }
        this.track.volume = this.volume;
        this.track.play();
    },
    toggleMusic: function() {
        if (this.track)
            this.stopMusic()
        else
            this.playMusic();
    },
    stopMusic: function() {
        if (!this.track)
            return;
        if (this.track.paused)
            this.track.play()
        else
            this.track.pause();
    },
    playSound: function(name, repeat) {
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
    },
    stopSound: function(name) {
        var sound = this.sounds[name];
        if (!sound)
            return;
        sound.pause();
        if (sound.repeat) {
            clearTimeout(sound.repeat);
            sound.repeat = null;
        }
    },
}
