define(["jquery"], function($) {
	var playRemote = function() {
	    return $('.switch-play-remote').prop('checked');
	}
	
	var playSound = function(id, playRemote) {
	    if (playRemote) {
		$.ajax({url: '?id=' + id});
	    } else {
		var audio = new Audio('/data/' + id);
		audio.play();
	    }
	}
	
	$("a.sound").each(function(_, sound){
		var soundfile = $(sound).attr("data-soundfile");
		$(sound).click(function() {
			playSound(soundfile, playRemote());
		    });
	    });
    });