var gulp = require("gulp");
var babel = require("gulp-babel");
var plumber = require('gulp-plumber');
var path = require("path");
var glob = require('glob');


gulp.task("compile-server", function() {
    return gulp.src("server/**/*.js")
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015', 'stage-0'],
            "plugins": [
                ["transform-runtime", {
                  "polyfill": false,
                  "regenerator": true
                }]
              ]
            }))
        .pipe(gulp.dest("dest/server"));
});

gulp.task("compile-routes", function() {
    return gulp.src("routes/**/*.js")
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015', 'stage-0'],
            "plugins": [
                ["transform-runtime", {
                  "polyfill": false,
                  "regenerator": true
                }]
              ]
            }))
        .pipe(gulp.dest("dest/routes"));
});

gulp.task('build',  function() {

    gulp.start('compile-server');
    gulp.start('compile-routes');
    gulp.watch('server/**/*.js', ['compile-server']);
    gulp.watch('routes/**/*.js', ['compile-routes']);
});

gulp.task("prod-server", function() {
    return gulp.src("server/**/*.js")
        .pipe(plumber())
        .pipe(babel())
        .pipe(gulp.dest("dest-tmp/server"));
});

gulp.task("prod-routes", function() {
    return gulp.src("routes/**/*.js")
        .pipe(plumber())
        .pipe(babel())
        .pipe(gulp.dest("dest-tmp/routes"));
});

gulp.task('prod',function() {
    gulp.start('prod-server');
    gulp.start('prod-routes');
});