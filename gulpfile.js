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
    livereload = require("gulp-livereload"),
    nodemon = require("gulp-nodemon"),
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
    return gulp.src(["./app/**/*.css"])
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
    return gulp.src("./app/**/*.html")
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

/* servidor y livereload */

gulp.task('watch-dev', ['build-dev'], function() {

    // start nodemon to auto-reload the dev server
    nodemon({ script: 'server.js', ext: 'js', watch: ['devServer/'], env: {NODE_ENV : 'development'} })
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        });

    // start live-reload server
    livereload.listen({ start: true });

    // watch index
    gulp.watch("./app/index.html", function() {
        var sources = gulp.src(["./dist.dev/js/**/*.js", "./dist.dev/**/*.css"]);
        var vendor = gulp.src(["./dist.dev/vendor/**/*"]).pipe(order(['jquery.js', 'angular.js', 'angular-animate.js', "angular-route.js"]));
        return gulp.src("./app/index.html")
            .pipe(inject(vendor, { ignorePath: "/dist.dev", name: "bower"}))
            .pipe(inject(sources, { ignorePath: "/dist.dev" }))
            .pipe(gulp.dest("./dist.dev/"))
            .pipe(livereload());
    });

    // watch app scripts
    gulp.watch('app/**/*.js', function() {
        return browserify("./app/js/main.js", { debug: true })
            .bundle()
            .pipe(source("bundled.js"))
            .pipe(gulp.dest("./dist.dev/js/"))
            .pipe(livereload());
    });

    // watch html partials
    gulp.watch(["./app/**/*.html", "!./app/index.html"], function() {
        return gulp.src(["./app/**/*.html", "!./app/index.html"])
            .pipe(gulp.dest("./dist.dev/"))
            .pipe(livereload());
    });

    // watch styles
    gulp.watch(["./app/**/*.css"], function() {
        return gulp.src(["./app/**/*.css"])
            .pipe(gulp.dest("./dist.dev/"))
            .pipe(livereload());
    });

});


/* aliases */

gulp.task("build-dev", ["inject-dev"]);
gulp.task("build-prod", ["inject-prod"]);

gulp.task("default", ["build-dev"]);
