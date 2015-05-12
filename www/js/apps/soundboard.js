define(["jquery", "socketio", "./utils/player", "./utils/stats", 'goog!visualization,1.1,packages:[line]'],
    function ($, io, player, stats) {
        var socket = io();

        var playFile = function (file, target) {
            switch (target) {
                case "remote":
                    socket.emit('playRemote', file);
                    break;
                case "broadcast":
                    socket.emit('playBroadcast', file);
                    break;
                case "local":
                    player.playSoundLocal(file);
                    break;
                default:
            }
        };
        
        // Server gives us a play direction
        socket.on('play', function (soundfile) {
            player.playSoundLocal(soundfile);
        });

        // Server asks us to cache a file
        socket.on('cache', function (soundfile) {
            player.cacheSound(soundfile);
        });

        var soundsList = $("#sounds-list").get(0);
        if (soundsList) {

            soundsList.onPlay = function (file) {
                playFile(file, document.querySelector("#play-target").getTarget());
            };
            socket.on('files', function (files) {
                soundsList.files = files;
            });
            
            socket.on('title', function (title) {
                $("#title").text(title);
            });

            socket.emit('getFiles');
            socket.emit('getTitle');
                        
        } else {
            var getTarget = function () {
                return $('header button.active').attr('data-target');
            };

            // User clicked on sound button
            $(document).on("click", ".button", function (e) {
                var soundfile, $this;

                $this = $(this);
                soundfile = $this.attr("data-sound");
                $this.toggleClass('button-clicked');

                playFile(soundfile, getTarget());

                e.preventDefault();
            });

            $('header button').on('click', function (e) {
                $('header button.active').removeClass('active')
                $(this).addClass('active');
                return false;
            });
        }
    });
