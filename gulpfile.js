// Импорт пакетов
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const gulpPug = require('gulp-pug');
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size');
const newer = require('gulp-newer');
const browsersync = require('browser-sync').create();
const sitemapGenerator = require('gulp-sitemap');
const robotsTxt = require('gulp-robots');
const del = require('del');

// Пути исходных файлов src и пути к результирующим файлам dest
const paths = {
  pug: {
    src: ['src/**/*.pug', '!./node_modules/**'],
    dest: 'dist/',
  },
  html: {
    src: ['src/**/*.html'],
    dest: 'dist/',
  },
  styles: {
    src: ['src/scss/**/*.sass', 'src/scss/**/*.scss', 'src/scss/**/*.css'],
    dest: 'dist/css/',
  },
  scripts: {
    src: ['src/scripts/**/*.js'],
    dest: 'dist/js/',
  },
  images: {
    src: 'src/img/**',
    dest: 'dist/img/',
  },
  fonts: {
    src: 'src/fonts/**',
    dest: 'dist/fonts/',
  },
  sitemap: {
    src: 'dist/**/*.html',
    dest: 'dist/',
  },
  robots: {
    src: 'dist/index.html',
    dest: 'dist/',
  },
};

// Очистить каталог dist, удалить все кроме изображений
function clean() {
  return del(['dist/*', '!dist/img']);
}

// pug
function pug() {
  return gulp
    .src(paths.pug.src)
    .pipe(
      gulpPug({
        basedir: __dirname,
      })
    )
    .pipe(
      size({
        showFiles: true,
      })
    )
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browsersync.stream());
}

// HTML
function html() {
  return gulp
    .src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(
      size({
        showFiles: true,
      })
    )
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browsersync.stream());
}

// CSS и SCSS
function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(
      cleanCSS({
        level: 2,
      })
    )
    .pipe(
      rename({
        basename: 'style',
        suffix: '.min',
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(
      size({
        showFiles: true,
      })
    )
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browsersync.stream());
}

// JS
function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(
      size({
        showFiles: true,
      })
    )
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browsersync.stream());
}

// Сжатие изображений
function img() {
  return gulp
    .src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(
      imagemin({
        progressive: true,
      })
    )
    .pipe(
      size({
        showFiles: true,
      })
    )
    .pipe(gulp.dest(paths.images.dest));
}

// fonts
function fonts() {
  return gulp
    .src(paths.fonts.src)
    .pipe(
      size({
        showFiles: true,
      })
    )
    .pipe(gulp.dest(paths.fonts.dest));
}

// sitemap
function sitemap() {
  return gulp
    .src(paths.sitemap.src)
    .pipe(sitemapGenerator({ siteUrl: 'https://dpk78.vasilevich.blog' }))
    .pipe(gulp.dest(paths.sitemap.dest));
}

// robots
function robots() {
  return gulp
    .src(paths.robots.src)
    .pipe(
      robotsTxt({
        useragent: '*',
        // allow: ['/'],
        disallow: ['/'],
      })
    )
    // .pipe(gulp.dest('robots.txt'));
    .pipe(gulp.dest(paths.sitemap.dest));
}

// Отслеживание изменений в файлах и запуск лайв сервера
function watch() {
  browsersync.init({
    server: {
      baseDir: './dist',
    },
  });
  gulp.watch(paths.html.dest).on('change', browsersync.reload);
  gulp.watch(paths.fonts.src, fonts);
  gulp.watch(paths.pug.src, pug);
  gulp.watch(paths.html.src, html);
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.images.src, img);
  gulp.watch(paths.sitemap.src, sitemap);
  gulp.watch(paths.robots.src, robots);
}

// Таски для ручного запуска с помощью gulp clean, gulp html и т.д.
exports.fonts = fonts;
exports.clean = clean;
exports.pug = pug;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.img = img;
exports.watch = watch;
exports.sitemap = sitemap;

// Task, который выполняется по команде gulp
exports.default = gulp.series(
  clean,
  fonts,
  pug,
  html,
  sitemap,
  robots,
  gulp.parallel(styles, scripts, img),
  watch
);
