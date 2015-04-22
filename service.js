var express = require('express');
var exec    = require('child_process').exec;
var walk    = require('walk');
var async   = require('async')

var app     = express();

var soundsDir = "/home/alexanders/sounds"
var scriptDir = "/home/alexanders/sounds"

var countCache = {}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function getFiles(done) {
    var files   = [];
    var walker  = walk.walk(soundsDir, { followLinks: false });

    walker.on('file', function(root, stat, next) {
	if(stat.name.endsWith(".wav")) {
	    files.push(root + '/' + stat.name);
	}
	next();
    });

    walker.on('end', function() {
	done(files);
    });
}

function getStats(file, callback) {
    if (file in countCache) {
	callback(
	    null,
	    {file: file, count: countCache[file]});	
    } else {
	console.log("Slow stats fetching of " + file);
	exec(
	    scriptDir + "/stats.sh " + file, 
	    function(error, stdout, stderr){ 
		var count = parseInt(stdout);
		countCache[file] = count;
		callback(
		    null, 
		    {file: file, count: count});
	    });
    }
}

app.get('/', function(req, res){
    if (!!req.query.id) {
	if (req.query.id in countCache) {
	    countCache[req.query.id] =  countCache[req.query.id] + 1;
	}
	exec(scriptDir + '/play.sh ' + req.query.id)
    } 

    getFiles(function(files) {
	async.map(
	    files, 
	    getStats, 
	    function(err, results) {
		res.send(
		    results.sort(function(a, b) {
			return b.count-a.count;
		    }).map(
			function(result) {
			    return "<a href=/?id="+result.file+">"+
				result.file+
				" "+
				result.count + 
				"</a>";			    
			}).join("<br>"));});
    });
});

app.listen(3000);
