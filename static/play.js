var soundboard = new function() {
    this.play = function(id, playRemote) {
        if (playRemote) {
            $.ajax({
                url: '?id=' + id
            });
        } else {
            var audioElement = document.createElement('audio');
            audioElement.setAttribute('src', '/data/' + id);
            audioElement.setAttribute('autoplay', 'autoplay');

            $.get();
            audioElement.addEventListener("load", function() {
                audioElement.play();
            }, true);
        }
    }
}