var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var less = require("gulp-less");
var rename = require("gulp-rename");

var fs = require("fs");

var htmlreplace = require("gulp-html-replace");

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
        .pipe(rename("bundle.css"))
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


    return gulp.src('index.html')
        .pipe(htmlreplace({
            css: "bundle.css?v=" + hash,
            js: "bundle.js?v=" + hash,
        }))
        .pipe(rename("bundle.html"))
        .pipe(gulp.dest("."));
});




gulp.task("nwbuild", function() {
    var NwBuilder = require("nw-builder");
    var nw = new NwBuilder({
        files: [
            "./package.json",
            "./sources.json",
            "./index.html",
            "./main.less",
            "./metadata.json",
            "./color-picker.css",
            "./dev-loader.js",
            "./favicon.ico",
            "./assets/**",
            "./books/**",
            "./news/**",
            "./src/**",
            "./lib/**",
        ],
        appName: "rogalia",
        buildDir: "./build",
        flavor: "normal", // sdk
        cacheDir: "./build/cache/",
        platforms: ["win32", "linux64", "linux32", "osx64"],
        version: "0.17.5",
    });

    nw.build().then(function () {
        console.log("all done!");
    }).catch(function (error) {
        console.error(error);
    });
});
