define(["jquery", "socketio", "howler"], function($, io, howler) {
    var socket = io();
    // Function returning true if sound should be played remote
    var playRemote = function() {
        return $('.switch-play-remote').prop('checked');
    }
    var getTarget = function() {
            return $('header button.active').attr('data-target');
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
            var sound = new howler.Howl({
                urls: ['/data/' + soundfile]
            }).play();
        }

    // User clicked on sound button
    $(document).on("click", ".button", function(e) {
        var soundfile, target, $this;

        $this = $(this);
        soundfile = $this.attr("data-sound");
        target = getTarget();

        e.preventDefault();
        $this.toggleClass('button-clicked');

        switch(target){
            case "remote":
                playSoundRemote(soundfile);
                break;
            case "broadcast":
                playSoundBroadcast(soundfile);
                break;
            case "local":
                playSoundLocal(soundfile);
                break;
            default:
        }

    });
    // Server gives us a play direction
    socket.on('play', function(soundfile) {
        playSoundLocal(soundfile);
    });

    $('header button').on('click', function(e) {
        $('header button.active').removeClass('active')
        $(this).addClass('active');
        return false;
    });
});