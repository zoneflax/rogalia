var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var less = require("gulp-less");

var fs = require("fs");
var replace = require("gulp-replace");

var exec = require("child_process").execSync;

gulp.task("default", function() {
    return gulp.start("js", "less", "bump");

});

gulp.task("js", function() {
    var sources = JSON.parse(fs.readFileSync("./sources.json"));
    return gulp.src(sources)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat("bundle.js"))
        .pipe(uglify())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});

gulp.task("less", function () {
  return gulp.src("main.less")
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});

gulp.task("bump", function() {
    var commit = exec("git log -1 --format=%ci")
        .toString()
        .substring(0, 19).
        replace(" ", "_");

    var version = JSON.parse(fs.readFileSync("./package.json")).version.split(".");
    var hash = version[0] + "." + version[1] + "." + commit;

    return gulp.src("index.html")
        .pipe(replace("$version", hash))
        .pipe(gulp.dest("."));
});
