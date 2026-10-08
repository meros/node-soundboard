# node-soundboard

A web soundboard in Node.js, written in 2015. Phones open the page and play sounds on the server's speaker, on every connected device at once, or on the phone itself.

Our team bought a soundboard - you know to accentuate jokes and such:

![Le soundboard](https://user-images.githubusercontent.com/450310/110112387-f6e7c580-7db1-11eb-9842-b909c800218f.png)

The very definition of a soundboard states that it must contain the ubiquitous fart sound. And the board had that.. but to our great horror and dismay the box was missing the also ubiquitous rimshot (only second to fart sounds in priority on a sound board)

I mean how are you supposed to know if its a joke if there is no rimshot? A lesser known fact is that the rimshot was invented by the ancient romans to accentuate jokes. [Cato the elder](http://en.wikipedia.org/wiki/Cato_the_Elder) jokingly quipped “[Carthago delenda est](http://en.wikipedia.org/wiki/Carthago_delenda_est)”. But alas, the joke was lost on the audience and thus the city was destroyed. After this small mishap the rimshot was invented to accentuate the j/k lol

We didn’t want our workstations destroyed and thus we needed (**really needed**) a rimshot.

What we also needed was more fart sounds. The box had only one and you can only express yourself in limited ways with one fart sound. So we decided to roll our own...

The application is mobile first naturally because if you have stand ups where you sit down its way too much exercise to walk up to a computer to play a funny sound. So you can now play sounds sitting down on your stand up.

Features:
* Unlimited (almost) fart sounds
* Unlimited (almost) rimshots
* Unlimited (almost) any sound (given that you are covered in the two categories above)
* Mobile friendly
* Remote playback on server for 'I didn't just ruin the conentration in the room' deniability
* Broadcast playback to all connected client AT THE SAME TIME for the ultimate farting-around experience
* Local playback on your mobile if you are too far away from any speaker
* 100% vegan

In our own study of productivity using a sample of 5 people (accidentally the same as in our team) and no control groups we can now loosely quote the [Hawthorne effect](http://en.wikipedia.org/wiki/Hawthorne_effect) for raising the effectiveness in our team by at least 500% thanks to the productivity boost of multiple fart sounds and a rimshots.

## How to run

You need Node.js, npm, Bower and Gulp 3, plus `aplay` (ALSA) on the server for remote playback. The code dates from 2015 and has not been updated, so expect an old Node.js version to be needed (Gulp 3 and the `lwip` image library do not build on current releases).

```bash
npm install -g bower gulp@3
npm install
gulp
```

`gulp` installs the front-end packages with Bower into `www/bower_components`, then starts `soundboard.js` with nodemon. Open http://localhost:8080 on your phone or computer.

Sounds are the `.wav` files in `~/sounds`. Put a `.jpg`, `.gif` or `.png` with the same base name next to a sound to give its button a picture. The directory, page title and port are set in `configuration.js`. The server also plays `bandcamp.wav` at 08:05 Sunday to Friday.

The server plays only the names of existing `.wav` files in that directory, and it runs `aplay` without a shell. `node --test test-sound-file.js` tests that check.

## Status

Not maintained. The code was written in 2015. In 2026 a security fix closed a command injection: before it, any client could run shell commands on the server through a sound name.

## License

0BSD. See [LICENSE](LICENSE).
