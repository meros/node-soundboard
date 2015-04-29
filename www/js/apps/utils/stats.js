define(["jquery", 'asyncmap'], function($, asyncmap) {
    return {
        getStats: function(soundfiles, callback) {
            asyncmap.map(soundfiles,
                function(soundfile, callback) {
                    var url = '/data/' + soundfile + '.stats';
                    $.get(url, function(stats) {
                        var clicks = stats.split('\n')
                            .map(function(dateString) {
                                return new Date(dateString);
                            })
                            .filter(function(date) {
                                return !isNaN(date.getTime());
                            })
                            .map(function(date) {
                                return {
                                    date: date,
                                    soundfile: soundfile
                                };
                            });

                        callback(null, clicks);
                    });
                },
                callback);
        }
    };
});