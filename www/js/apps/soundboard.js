define(["jquery", "socketio", "howler", 'goog!visualization,1.1,packages:[line]'], function($, io, howler) {
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

    $.get('/data/fart-08.wav.stats', function(data) {
	// Create the data table.

	var lines = data.split('\n');
	var rows = lines.map(function(dateStr, idx) {
	    return [new Date(dateStr), idx];
	});

	var dataTable = new google.visualization.DataTable();
        dataTable.addColumn('date', 'Date');
        dataTable.addColumn('number', 'Play count');
	dataTable.addRows(rows);

        // Set chart options
        var options = {'title':'Stats',
                       'width':800,
                       'height':300};

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.charts.Line(document.getElementById('chart_div'));
        chart.draw(dataTable, options);
    });

 });
