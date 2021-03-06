var gulp = require("gulp");
var jshint = require("gulp-jshint"),
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
    es = require("event-stream"),
    Q = require("q"),
    sass = require("gulp-ruby-sass"),
    argv = require("yargs").argv,
    gulpif = require("gulp-if"),
    imagemin = require("gulp-imagemin"),
    order = require("gulp-order");

var config = require("./build-config.json");

/* pipes */
var pipes = {
    copyCSS: function() {
        var env = argv.production ? config.prod : config.dev;
        return gulp.src(config.common.styles_css)
            .pipe(gulpif(argv.production, minifyCSS({ comments: true, spare: true })))
            .pipe(gulp.dest(env.styles));
    },
    copySASS: function() {
        var env = argv.production ? config.prod : config.dev;
        return sass(config.common.styles_sass, { quiet: false })
            .on('error', sass.logError)
            .pipe(gulpif(argv.production, minifyCSS({ comments: true, spare: true })))
            .pipe(gulp.dest(env.styles));
    },
    copyAssets: function() {
        var env = argv.production ? config.prod : config.dev;
        return gulp.src(config.common.images)
            .pipe(gulpif(argv.production, imagemin()))
            .pipe(gulp.dest(env.dist + '/img/'));
    },
    browserify: function() {
        var env = argv.production ? config.prod : config.dev;
        var opts = { debug: env.debug }
        if (env.debug) {
            return browserify(config.common.main, opts)
                .bundle()
                .pipe(source("bundled.js"))
                .pipe(gulp.dest(env.js));
        }
        else {
            return browserify(config.common.main, opts)
                .bundle()
                .pipe(source("bundled.min.js"))
                .pipe(buffer())
                .pipe(uglify())
                .pipe(gulp.dest(env.js));
        };
    },
    copyBowerComponents: function() {
        var env = argv.production ? config.prod : config.dev;
        return gulp.src(bowerFiles(["**/*.js", "**/*.css"]))
            .pipe(gulp.dest(env.vendor));
    },
    copyBowerFontComponents: function() {
        var env = argv.production ? config.prod : config.dev;
        return gulp.src(bowerFiles(["**/*.eot", "**/*.svg", "**/*.ttf", "**/*.woff", "**/*.woff2"]))
            .pipe(gulp.dest(env.fonts));
    },
    copyHtmlFiles: function() {
        var env = argv.production ? config.prod : config.dev;
        return gulp.src(config.common.partials)
            .pipe(gulp.dest(env.dist));
    },
    injectIndex: function() {
        var env = argv.production ? config.prod : config.dev;
        var scripts = gulp.src([ env.scripts_filter]).pipe(order(env.scripts_order));
        var styles = gulp.src([ env.css_filter ]).pipe(order(env.styles_order));
        var vendor = gulp.src([env.vendor_filter]).pipe(order(env.vendor_order));
        return gulp.src(config.common.index)
            .pipe(inject(vendor, { ignorePath: env.inject_ignorePath, name: "bower" }))
            .pipe(inject(scripts, { ignorePath: env.inject_ignorePath }))
            .pipe(inject(styles, { ignorePath: env.inject_ignorePath }))
            .pipe(gulp.dest(env.dist));
    },
    clean: function(){
        /*var deferred = Q.defer();
        return del(env.dist, function(){
            deferred.resolve();
        });
        return deferred.promise;
        */
        var env = argv.production ? config.prod : config.dev;
        return del(env.dist);
    }
    
    
};


/* common tasks */
gulp.task("lint", function(){
    gulp.src([config.common.scripts])
        .pipe(jshint())
        .pipe(jshint.reporter("default"))
        .pipe(jshint.reporter("fail"));
});

/* Gulp tasks for Development Environment */

gulp.task("clean", function(){
    return pipes.clean();
});

gulp.task("copy-styles", ["clean"], function(){
    return es.merge(pipes.copyCSS(), pipes.copySASS());
});

gulp.task("browserify", ["clean"], function(){
    return pipes.browserify();
});

gulp.task("copy-bower-components", ["clean"], function(){
    return es.merge(pipes.copyBowerComponents(), pipes.copyBowerFontComponents());
});

gulp.task("copy-html-files", ["clean"], function(){
    return es.merge(pipes.copyAssets(), pipes.copyHtmlFiles());
});

gulp.task("inject", ["copy-styles", "copy-html-files", "copy-bower-components", "browserify"], function(){
    return pipes.injectIndex();
});

/* MAIN TASKS */

/* server & livereload */

gulp.task('watch', ['build'], function() {

    // start nodemon to auto-reload the dev server
    var environment = argv.production ? "production" : "development";
    nodemon({ script: 'server.js', ext: 'js', watch: ['devServer/'], env: {NODE_ENV : environment} })
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        });

    // start live-reload server
    livereload.listen({ start: true });

    // watch index
    gulp.watch("./app/index.html", function() {
        return pipes.injectIndex().pipe(livereload());
    });

    // watch app scripts
    gulp.watch('app/**/*.js', function() {
        return pipes.browserify().pipe(livereload());
    });

    // watch html partials
    gulp.watch(["./app/**/*.html", "!./app/index.html"], function() {
        return pipes.copyHtmlFiles().pipe(livereload());
    });

    // watch styles
    gulp.watch(["./app/styles/**/*.css"], function() {
        return pipes.copyCSS().pipe(livereload());
    });

});


/* aliases */

gulp.task("build", ["inject"]);

gulp.task("default", ["build"]);
