var express = require('express');
var exec    = require('child_process').exec;
var walk    = require('walk');
var async   = require('async')

var app     = express();

var soundsDir = "/home/alexanders/sounds"
var scriptDir = "/home/alexanders/sounds"

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
    console.log(file);
    exec(
	scriptDir + "/stats.sh " + file, 
	function(error, stdout, stderr){ 
	    callback(
		null, 
		{file: file, count: stdout});
	});
}

app.get('/', function(req, res){
    if (!!req.query.id) {
	exec(scriptDir + '/play.sh ' + req.query.id)
    } 

    console.log("asdf");
    getFiles(function(files) {
	async.map(
	    files, 
	    getStats, 
	    function(err, results) {

		res.send(
		    results.map(
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
