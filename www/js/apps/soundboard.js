define(["jquery", "socketio", "howler"], function($, io, howler) {
    var socket = io();
    // Function returning true if sound should be played remote
    var playRemote = function() {
        return $('.switch-play-remote').prop('checked');
    }
    var getTarget = function() {
            return $('.list-group-item.active').attr('data-target');
        }
        // Play sound remote or in browser
    var playSoundRemote = function(soundfile) {
        $.ajax({
            url: '?id=' + soundfile
        });
    };
    // Play sound broadcast
    var playSoundBroadcast = function(soundfile) {
            socket.emit('play', soundfile);
        }
        // Play sound local
    var playSoundLocal = function(soundfile) {
            new howler.Howl({
                urls: ['/data/' + soundfile]
            }).play();
        }
        // User clicked on sound button
    $(document).on("click", ".button-sound", function() {
        var soundfile = $(this).attr("data-sound");
        var target = getTarget();
        if (target === "remote") {
            playSoundRemote(soundfile);
        } else if (target === "broadcast") {
            playSoundBroadcast(soundfile);
        } else if (target === "local") {
            playSoundLocal(soundfile);
        }
    });
    // Server gives us a play direction
    socket.on('play', function(soundfile) {
        playSoundLocal(soundfile);
    });

    $('.list-group-item').on('click', function(e) {
        $(this).closest(".list-group").children().removeClass('active');
        $(this).addClass('active');

        return false;
    });
});