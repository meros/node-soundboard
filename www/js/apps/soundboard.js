define(["jquery", "socketio", "howler"], function($, io, howler) {
    var socket = io();

    // Function returning true if sound should be played remote
    var playRemote = function() {
        return $('.switch-play-remote').prop('checked');
    }

    // Play sound remote or in browser
    var playSound = function(id, playRemote) {
        if (playRemote) {
            $.ajax({
                url: '?id=' + id
            });
        } else {
            socket.emit('play', id);
        }
    }

    // Bind click on all sound buttons
    $(".button-sound").each(function(_, sound) {
        var soundfile = $(sound).attr("data-sound");
        $(sound).click(function() {
            playSound(soundfile, playRemote());
        });
    });

    socket.on('play', function(soundfile) {
        new howler.Howl({
            urls: ['/data/' + soundfile]
        }).play();

    });
});