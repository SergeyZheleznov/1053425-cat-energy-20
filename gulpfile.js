"use strict";

const gulp = require ("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const delt = require("del");
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const htmlmin = require("gulp-htmlmin");

//Styles

//const stylesmin = () => {
//  return gulp.src("source/less/style.less")
//    .pipe(plumber())
//    .pipe(sourcemap.init())
//    .pipe(less())
//    .pipe(postcss([
//      autoprefixer()
//    ]))
//    .pipe(csso())
//    .pipe(rename("style.min.css"))
//    .pipe(sourcemap.write("."))
//    .pipe(gulp.dest("build/css"))
//    .pipe(sync.stream());
//}

//exports.stylesmin = stylesmin;

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(rename("style.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
  .pipe (imagemin([
    imagemin.optipng({optimizationLevel: 1}),
    imagemin.mozjpeg({progressive: true}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest("build/img"))
}

exports.images = images;

const web = () => {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality:90}))
    .pipe(gulp.dest("build/img"))
}

exports.web = web;

const sprite = () => {
  return gulp.src("source/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
}

exports.sprite = sprite;

const html = () => {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
}

exports.html = html;

//const minify = () => {
//  return gulp.src("source/*.html")
//  .pipe(htmlmin({ collapseWhitespace: true }))
//  .pipe(gulp.dest("build"));
//}

//exports.minify = minify;

const clean = () => {
  return delt("build");
}

exports.clean = clean;

const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff, woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.ico"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
};

exports.copy = copy;
//Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

//Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html", gulp.series(html));
}

exports.default = gulp.series (
  styles, server, watcher
);

const build = gulp.series(clean, copy, styles, sprite, html);
exports.build = build;

const start = gulp.series(build, server);
exports.start = gulp.series(build, server, watcher);
