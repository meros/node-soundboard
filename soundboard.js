var async = require('async')
var execFile = require('child_process').execFile;
var fs = require('fs');
var path = require('path');
var walk = require('walk');
var watch = require('node-watch');
var lwip = require('lwip');
var schedule = require('node-schedule');

var configuration = require('./configuration');
var resolveSoundFile = require('./sound-file');
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

// Play a sound on the server. The name comes from clients, so only the name
// of an existing .wav file in dataDir is accepted, and no shell is involved.
function playFile(file) {
    var soundPath = resolveSoundFile(configuration.dataDir, file);
    if (!soundPath) {
        console.log("Refusing to play " + JSON.stringify(file));
        return false;
    }

    execFile(path.join(__dirname, 'scripts', 'play.sh'), [soundPath], function (err) {
        if (err) {
            console.log("Could not play " + soundPath + ": " + err.message);
        }
    });
    return true;
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
    if (!playFile(soundfile)) {
        res.status(404).send("No such sound");
        return;
    }
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
        if (err) {
            res.status(404).send("No such image");
            return;
        }
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
        // Play on the server, and only broadcast names that are real sounds
        if (!playFile(soundfile)) {
            return;
        }
        console.log("Broadcasting " + soundfile + " to " + io.engine.clientsCount + " clients");
        io.sockets.emit('play', soundfile);
    });

    socket.on('playRemote', function (soundfile) {
        if (playFile(soundfile)) {
            console.log("Playing remote " + soundfile);
        }
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
        if (!movement || typeof movement.x !== 'number' || typeof movement.y !== 'number') {
            return;
        }
        console.log("Mouse movement " + movement.x + " " + movement.y);
        io.sockets.emit('pointer', { x: movement.x, y: movement.y });
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
