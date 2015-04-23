var express = require('express');
var exec    = require('child_process').exec;
var walk    = require('walk');
var async   = require('async')
var fs	    = require('fs');
var mustache = require('mustache');
var path    = require('path');

var app     = express();

var configuration = require('./configuration');

var soundsDir = configuration.directories.sounds;
var scriptDir = configuration.directories.sounds;

var countCache = {}

var htmlTemplate = fs.readFileSync("template.mustache", "utf8");
var imageTypes = [".jpg", ".gif", ".png"];

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function getFiles(done) {
    var files   = [];
    var walker  = walk.walk(soundsDir, { followLinks: false });

    walker.on('file', function(root, stat, next) {
	if(stat.name.endsWith(".wav")) {
	    files.push({root: root, name: stat.name});
	}

	next();
    });

    walker.on('end', function() {
	done(files);
    });
}

function addFileImage(file, done) {
    var imgBasePath = file.root + "/img/";
    var imgBaseName = file.name.replace(/\.[^/.]+$/, "");

    var potentialImageFiles = imageTypes.map(function(type) {
	return imgBaseName + type;
    });
    
    async.filter(
	potentialImageFiles, 
	function(potentialFile, callback) {
	    fs.exists(imgBasePath + potentialFile, callback);
	},
	function(existingImageFiles) {
	    result = file;
	    if (typeof existingImageFiles[0] === 'undefined') {
		result.imgName = "generic_image.jpg";
	    } else {
		result.imgName = existingImageFiles[0];
	    }

	    done(result);
	}
    )
}

function playFile(file) {
    if (file in countCache) {
	countCache[file] = countCache[file] + 1;
    }

    exec(scriptDir + '/play.sh ' + file)
}

app.get('/', function(req, res){
    if (!!req.query.id) {
	playFile(req.query.id);
    } 

    getFiles(function(files) {
	async.map(
	    files, 
	    function(file, callback) {
		addFileImage(file, function(file) {
		    callback(null, file);
		})
	    },
	    function(error, result) {
		console.log(result);
 		res.send(mustache.to_html(htmlTemplate, {files: result}));
	})
    });
});

app.use('/img', express.static(soundsDir + '/img/'));

app.listen(8080);
console.log('App starting...');
