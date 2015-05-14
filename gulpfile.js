var gulp = require('gulp');
var bower = require('gulp-bower');
var nodemon = require('gulp-nodemon');

gulp.task('default', ['nodemon'], function(){});


gulp.task('bower', 
	  function() {
	      console.log('running bower');
	      return bower({cwd: './www/'})
		  .pipe(gulp.dest('www/bower_components'));});

gulp.task('nodemon', 
	  ['bower'],
	  function () {
	      console.log('serving');
	      nodemon({
		      script: 'soundboard.js',
			  ext: 'js'}).on(
					 'restart',
					 ['bower']);})