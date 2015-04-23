var express = require('express');
var exec = require('child_process').exec;
var walk = require('walk');
var async = require('async')
var fs = require('fs');
var mustache = require('mustache');
var path = require('path');

var app = express();

var configuration = require('./configuration');

var htmlTemplate = fs.readFileSync("template.mustache", "utf8");
var imageTypes = [".jpg", ".gif", ".png"];

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function getSoundFileNames(done) {
    var files = [];
    var walker = walk.walk(configuration.soundsDir, {
        followLinks: false
    });

    walker.on('file', function(root, stat, next) {
        if (stat.name.endsWith(".wav")) {
            files.push(stat.name);
        }

        next();
    });

    walker.on('end', function() {
        done(files);
    });
}

function getFileFullData(file, done) {
    var imgBasePath = configuration.soundsDir + "/img/";
    var imgBaseName = file.replace(/\.[^/.]+$/, "");

    var potentialImageFiles = imageTypes.map(function(type) {
        return imgBaseName + type;
    });

    async.filter(
        potentialImageFiles,
        function(potentialFile, callback) {
            fs.exists(imgBasePath + potentialFile, callback);
        },
        function(existingImageFiles) {
            result = {
                name: file
            };

            if (typeof existingImageFiles[0] === 'undefined') {
                result.imgName = "/img/generic_image.jpg";
            } else {
                result.imgName = "/img/" + existingImageFiles[0];
            }

            done(null, result);
        }
    )
}

function playFile(file) {
    var command = __dirname + '/scripts/play.sh ' + configuration.soundsDir + "/" + file;
    console.log(command)
    exec(command)
}

function getFilesFullData(callback) {
    getSoundFileNames(function(filesNames) {
        async.map(
            filesNames,
            getFileFullData,
            callback);
    });
}

app.get('/', function(req, res) {
    if (!!req.query.id) {
        playFile(req.query.id);
    }

    getFilesFullData(function(error, result) {
        res.send(mustache.to_html(htmlTemplate, {
            pageTitle: configuration.pageTitle,
            files: result
        }));
    });
});

app.use('/img', express.static(configuration.soundsDir + '/img/'));
app.use('/static', express.static(__dirname + '/static/'));
app.listen(configuration.listenPort);

console.log('Soundboard is starting on port ' + configuration.listenPort + '...');