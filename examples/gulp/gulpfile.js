'use strict';

const path = require('path');
const del = require('del');
const gulp = require('gulp');
const connect = require('gulp-connect');
const gulpIf = require('gulp-if');
const sass = require('gulp-sass');
const babel = require("gulp-babel");
const sourcemaps = require('gulp-sourcemaps');
const connectSourcemaps = require('../../');


const options = {
    sourcemaps: {
	// add source maps annotations into compiled files
        addComment: false,
	// include original sources into source maps
        includeContent: false,
	// inject annotations to served files on the fly using the "connect-sourcemaps" middleware
        annotate: false,
	// respond with SourceMap: <url> header 
        sourceMapHeader: true,
	// respond with X-SourceMap: <url> header 
        xSourceMapHeader: false,
	// source maps are in the same directory as compiled files plus ".map" suffix.
        suffix: '.map',
    },
    build: {
        base: './public',
        html: './public',
        style: './public/css',
        js: './public/js',
    },
    src: {
        base: './src',
        html: './src/*.html',
        style: './src/sass/main.scss',
        js: './src/js/main.js',
    },
    watch: {
        html: './src/**/*.html',
        style: './src/sass/**/*.scss',
        js: './src/js/**/*.js',
    },
    connect: {
        src: '/src',
        style: '/src/sass',
        js: '/src/js',
    },
    clean: './public',
}

gulp.task('js:build', function() {
    return gulp.src(options.src.js)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write('.', {
            sourceRoot: options.connect.js,
            addComment: options.sourcemaps.addComment,
            includeContent: options.sourcemaps.includeContent,
            mapFile: mapFilePath => mapFilePath.replace(/\.map$/, options.sourcemaps.suffix)
        }))
        .pipe(gulp.dest(options.build.js))
        .pipe(gulpIf('**/*.js', connect.reload()));
});

gulp.task('style:build', function() {
    return gulp.src(options.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('.', {
            sourceRoot: options.connect.style,
            addComment: options.sourcemaps.addComment,
            includeContent: options.sourcemaps.includeContent,
            mapFile: mapFilePath => mapFilePath.replace(/\.map$/, options.sourcemaps.suffix)
        }))
        .pipe(gulp.dest(options.build.style))
        .pipe(gulpIf('**/*.css', connect.reload()));
});

gulp.task('html:build', function() {
    return gulp.src(options.src.html)
        .pipe(gulp.dest(options.build.html))
        .pipe(gulpIf('**/*.html', connect.reload()));
});

gulp.task('build', gulp.parallel('html:build', 'style:build', 'js:build'));

gulp.task('watch', function() {
    gulp.watch(options.watch.style, gulp.series('style:build'));
    gulp.watch(options.watch.html, gulp.series('html:build'));
    gulp.watch(options.watch.js, gulp.series('js:build'));
});

gulp.task('connect', function() {
    connect.server({
        root: [options.build.base],
        livereload: true,
        middleware: function(connect, opt) {
            return [
                [options.connect.src,
                    connect.static(path.resolve(options.src.base), {
                        index: false
                    })
                ],
                [options.connect.src,
                    connect.directory(path.resolve(options.src.base))
                ],
                connectSourcemaps(options.sourcemaps)
            ];
        }
    });
});

gulp.task('clean', function() {
    return del(options.clean);
});

gulp.task('serve', gulp.series(
    'clean',
    'build',
    gulp.parallel('watch', 'connect')
));
