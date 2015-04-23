var express   = require('express');
var exec      = require('child_process').exec;
var walk      = require('walk');
var async     = require('async');
var mustache  = require('mustache');
var fs        = require('fs');

var configuration = require('./configuration');

var app     = express();
var soundsDir = configuration.directories.sounds;
var scriptDir = configuration.directories.sounds;

var countCache = {}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function getWavFiles(done) {
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

function getStatsForOneFile(file, callback) {
    if (file in countCache) {
	callback(
	    {file: file, name: file, count: countCache[file]});	
    } else {
	console.log("Slow stats fetching of " + file);
	exec(
	    scriptDir + "/stats.sh " + file, 
	    function(error, stdout, stderr){ 
		var count = parseInt(stdout);
		countCache[file] = count;
		callback(
		    {file: file, name: file, count: count});
	    });
    }
}

function playFile(file) {
    if (file in countCache) {
	countCache[file] = countCache[file] + 1;
    }

    exec(scriptDir + '/play.sh ' + file)
}

function getStatsForFiles(files, callback) {
    async.map(
	files, 
	function(file, callback) {
	    getStatsForOneFile(file, function(result) {
		callback(null, result);
	    });
	},
	function(err, result) {
	    callback(result);
	});
}

function getWavFilesWithStats(callback) {
    getWavFiles(function(files) {
	getStatsForFiles(files, function(filesWithStats) {
	    callback(filesWithStats);
	});
    });
}

var template = fs.readFileSync("index.template", "utf8");

app.get('/', function(req, res){
    if (!!req.query.id) {
	playFile(req.query.id);
    } 

    getWavFilesWithStats(function(filesWithStats) {
	console.log(filesWithStats);
	filesWithStats.sort(function(a, b) {
	    return b.count-a.count;
	});

	res.send(mustache.render(template, {data: filesWithStats}));
    });
});

app.listen(3000);
