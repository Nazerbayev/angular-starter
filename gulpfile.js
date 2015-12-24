var gulp = require("gulp");
var connect = require("gulp-connect"),
    jshint = require("gulp-jshint"),
    uglify = require("gulp-uglify"),
    inject = require("gulp-inject"),
    minifyCSS = require("gulp-minify-css"),
    browserify = require("browserify"),
    source = require("vinyl-source-stream"),
    buffer = require("vinyl-buffer"),
    bowerFiles = require("main-bower-files"),
    del = require("del"),
    order = require("gulp-order");

gulp.task("lint", function(){
    gulp.src(["./app/**/*.js"])
    .pipe(jshint())
    .pipe(jshint.reporter("default"))
    .pipe(jshint.reporter("fail"));
});

/* Gulp tasks for Development Environment */

gulp.task("clean-dev", function(){
    return del("./dist.dev/");
});

gulp.task("copy-css-dev", ["clean-dev"], function(){
    gulp.src(["./app/**/*.css"])
    .pipe(gulp.dest("./dist.dev/"));
});

gulp.task("browserify-dev", ["clean-dev"], function(){
    var opts = { debug: true }
    return browserify("./app/js/main.js", opts)
        .bundle()
        .pipe(source("bundled.js"))
        .pipe(gulp.dest("./dist.dev/js/"));
});

gulp.task("copy-bower-components-dev", ["clean-dev"], function(){
    return gulp.src(bowerFiles())
        .pipe(gulp.dest("./dist.dev/vendor"));
});

gulp.task("copy-html-files-dev", ["clean-dev"], function(){
    gulp.src("./app/**/*.html")
    .pipe(gulp.dest("./dist.dev/"));
});

gulp.task("inject-dev", ["copy-css-dev", "copy-html-files-dev", "copy-bower-components-dev", "browserify-dev"], function(){
    var sources = gulp.src(["./dist.dev/js/**/*.js", "./dist.dev/**/*.css"]);
    var vendor = gulp.src(["./dist.dev/vendor/**/*"]).pipe(order(['jquery.js', 'angular.js', 'angular-animate.js', "angular-route.js"]));
    return gulp.src("./dist.dev/index.html")
        .pipe(inject(vendor, {relative: true, name: "bower"}))
        .pipe(inject(sources, { relative: true }))
        .pipe(gulp.dest("./dist.dev/"));
});

/* Gulp tasks for Production Environment */

gulp.task("clean-prod", function(){
    return del("./dist.dev/");
});

gulp.task("copy-css-prod", ["clean-prod"], function(){
    var opts = { comments: true, spare: true };
    gulp.src(["./app/**/*.css"])
    .pipe(minifyCSS(opts))
    .pipe(gulp.dest("./dist.prod/"));
});

gulp.task("browserify-prod", ["clean-prod"], function(){
    return browserify("./app/js/main.js")
        .bundle()
        .pipe(source("bundled.min.js"))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest("./dist.prod/js/"))
});

gulp.task("copy-bower-components-prod", ["clean-prod"], function(){
    return gulp.src(bowerFiles())
        .pipe(gulp.dest("./dist.prod/vendor"));
});

gulp.task("copy-html-files-prod", ["clean-prod"], function(){
    gulp.src("./app/**/*.html")
    .pipe(gulp.dest("./dist.prod/"));
});

gulp.task("inject-prod", ["copy-css-prod", "copy-html-files-prod", "copy-bower-components-prod", "browserify-prod"], function(){
    var sources = gulp.src(["./dist.prod/js/**/*.js", "./dist.prod/**/*.css"]);
    var vendor = gulp.src(["./dist.prod/vendor/**/*"]).pipe(order(['jquery.js', 'angular.js', 'angular-animate.js', "angular-route.js"]));
    return gulp.src("./dist.prod/index.html")
        .pipe(inject(vendor, {relative: true, name: "bower"}))
        .pipe(inject(sources, { relative: true }))
        .pipe(gulp.dest("./dist.prod/"));
});

/* MAIN TASKS */

gulp.task("connectDev", ["inject-dev"], function(){
    connect.server({
        root: "dist.dev/",
        port: 8888
    });
});

gulp.task("connectProd", ["inject-prod"], function(){
    connect.server({
        root: "dist.prod/",
        port: 9999
    });
});

gulp.task("build-dev", ["connectDev"]);
gulp.task("build-prod", ["connectProd"]);

gulp.task("default", ["build-dev"]);
