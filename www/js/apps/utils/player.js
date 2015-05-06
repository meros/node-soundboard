define(["jquery", "howler", "socketio"], function($, howler, io) {
    var socket = io();
    
    return {
        // Play sound remote or in browser
        playSoundRemote: function(soundfile) {
            $.ajax({
                url: '?id=' + soundfile
            });
        },
        // Play sound broadcast
        playSoundBroadcast: function(soundfile) {
            socket.emit('play', soundfile);
        },
        // Play sound local
        playSoundLocal: function(soundfile) {
            var sound = new howler.Howl({
                urls: ['/data/' + soundfile]
            }).play();
        }
    };
});
