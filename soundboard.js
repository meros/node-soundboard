var async = require('async')
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var walk = require('walk');
var watch = require('node-watch');
var lwip = require('lwip');
var schedule = require('node-schedule');

var configuration = require('./configuration');
var imageTypes = [".jpg", ".gif", ".png"];

// Set up express and io
var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app).listen(configuration.listenPort),
    io = require('socket.io').listen(server);

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function getSoundFileNames(done) {
    var files = [];
    var walker = walk.walk(configuration.dataDir, {
        followLinks: false
    });

    walker.on('file', function (root, stat, next) {
        if (stat.name.endsWith(".wav")) {
            files.push(stat.name);
        }

        next();
    });

    walker.on('end', function () {
        done(files);
    });
}

function getFileFullData(file, done) {
    var imgBasePath = configuration.dataDir;
    var imgBaseName = file.replace(/\.[^/.]+$/, "");

    var potentialImageFiles = imageTypes.map(function (type) {
        return imgBaseName + type;
    });


    async.filter(
        potentialImageFiles,
        function (potentialFile, callback) {
            fs.exists(path.join(imgBasePath, potentialFile), callback);
        },
        function (existingImageFiles) {
            result = {
                name: file
            };
            result.imgName = existingImageFiles[0] || '';
            done(null, result);
        }
        )
}

function playFile(file) {
    var command = path.join(__dirname, '/scripts/play.sh') + ' ' + configuration.dataDir + "/" + file;
    exec(command)
}

function getFilesFullData(callback) {
    getSoundFileNames(function (filesNames) {
        async.map(
            filesNames,
            getFileFullData,
            callback);
    });
}

var oneDay = 86400000;

app.get('/play/*', function (req, res) {
    var soundfile = path.basename(req.path);
    playFile(soundfile);
    res.send("Playing " + soundfile);
});

app.use('/data', express.static(configuration.dataDir, { maxAge: oneDay }));
app.use('/', express.static(path.join(__dirname, './www')));

var rescaled = [];

app.get('/rescaled/*', function (req, res) {
    var soundfile = path.basename(req.path);
    console.log(soundfile);

    if (soundfile in rescaled) {
        res.send(rescaled[soundfile]);
        return;
    }

    lwip.open(path.join(configuration.dataDir, soundfile), function (err, image) {
        image.batch()
            .cover(100, 100)
            .toBuffer("jpg", {quality: 80}, function (err, buffer) {
                rescaled[soundfile] = buffer;
                res.send(buffer);
            });
    });
});

io.on('connection', function (socket) {
    socket.on('playBroadcast', function (soundfile) {
        console.log("Broadcasting " + soundfile + " to " + io.engine.clientsCount + " clients");
        // Broadcast play command to clients
        io.sockets.emit('play', soundfile);
        // Play on server as well
        playFile(soundfile);
    });

    socket.on('playRemote', function (soundfile) {
        console.log("Playing remote " + soundfile);
        playFile(soundfile);
    });

    socket.on('getFiles', function () {
        console.log("Requesting files!");
        getFilesFullData(function (error, files) { socket.emit('files', files); });
    });

    socket.on('getTitle', function () {
        console.log("Requesting title!");
        getSoundFileNames(function (files) { socket.emit('title', configuration.pageTitle); });
    });

    socket.on('pointer', function (movement) {
        console.log("Mouse movement " + movement.x + " " + movement.y);
        io.sockets.emit('pointer', movement);
    });
});

watch(configuration.dataDir, function (filename) {
    if (filename.indexOf(".stats", this.length - ".stats".length) === -1) {
        console.log('Data dir updated, pushing sound files!');
        getFilesFullData(function (error, files) { io.emit('files', files); });
    }
});

var j = schedule.scheduleJob('0 5 8 * * 0-5', function() {
    playFile("bandcamp.wav");
});

console.log('Soundboard is starting on port http://localhost:' + configuration.listenPort + '...');
