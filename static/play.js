var soundboard = new function() {
    this.play = function(id, playRemote) {
        if (playRemote) {
            $.ajax({
                url: '?id=' + id
            });
        } else {
            var audio = new Audio('/data/' + id);
	    audio.play();
        }
    }
}