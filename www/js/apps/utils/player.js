define(["jquery", "howler"], function ($, io, howler) {
    var socket = io();
    var cache = {};
    
    return {
            // Cache sound
            cacheSound: function (soundfile) {
                if (!(soundfile in cache)) {
                    cache[soundfile] = new howler.Howl({
                        urls: ['/data/' + soundfile]
                    });
                }
            },          
            // Play sound remote or in browser
            playSoundRemote: function (soundfile) {
                $.ajax({
                    url: '?id=' + soundfile
                });
            },
            // Play sound broadcast
            playSoundBroadcast: function (soundfile) {
                socket.emit('play', soundfile);
            },
            // Play sound local
            playSoundLocal: function (soundfile) {
                this.cacheSound(soundfile);
                cache[soundfile].play();
            }
        };
});