// Run with: node --test test-sound-file.js
var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('fs');
var os = require('os');
var path = require('path');
var resolveSoundFile = require('./sound-file');

var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'soundboard-'));
fs.writeFileSync(path.join(dir, 'rimshot.wav'), '');
fs.writeFileSync(path.join(dir, 'notes.txt'), '');
fs.mkdirSync(path.join(dir, 'folder.wav'));

test('accepts an existing .wav file', function () {
    assert.equal(resolveSoundFile(dir, 'rimshot.wav'), path.join(dir, 'rimshot.wav'));
});

test('rejects shell metacharacters', function () {
    assert.equal(resolveSoundFile(dir, 'rimshot.wav; touch /tmp/pwned'), null);
    assert.equal(resolveSoundFile(dir, '$(touch /tmp/pwned).wav'), null);
    assert.equal(resolveSoundFile(dir, '`id`.wav'), null);
});

test('rejects paths outside the data dir', function () {
    assert.equal(resolveSoundFile(dir, '../rimshot.wav'), null);
    assert.equal(resolveSoundFile(dir, '/etc/passwd'), null);
    assert.equal(resolveSoundFile(dir, '..'), null);
});

test('rejects other file types, folders and missing files', function () {
    assert.equal(resolveSoundFile(dir, 'notes.txt'), null);
    assert.equal(resolveSoundFile(dir, 'folder.wav'), null);
    assert.equal(resolveSoundFile(dir, 'missing.wav'), null);
});

test('rejects values that are not strings', function () {
    assert.equal(resolveSoundFile(dir, undefined), null);
    assert.equal(resolveSoundFile(dir, { toString: function () { return 'rimshot.wav'; } }), null);
    assert.equal(resolveSoundFile(dir, ['rimshot.wav']), null);
});

test.after(function () {
    fs.rmSync(dir, { recursive: true, force: true });
});
