const gulp = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const sourceMaps = require('gulp-sourcemaps');
const cleanCss = require('gulp-clean-css');
const pify = require('pify');
const git = pify(require('gulp-git'));
const pkg = require('./package.json');
const {exec} = require('child_process');
const pump = require('pump');

gulp.task('styles:clean', () => {
  return del('./dist/styles');
});

gulp.task('styles:sass', (cb) => {
  pump([
    gulp.src('./src/styles/sass/*.*'),
    gulp.dest('./dist/styles/sass'),
  ], cb);
});

gulp.task('styles:css:compile', (cb) => {
  pump([
    gulp.src('./src/styles/sass/index.scss'),
    sass(),
    rename('ng-shopping-cart.css'),
    gulp.dest('./dist/styles/css'),
  ], cb);
});

gulp.task('styles:css:min', (cb) => {
  pump([
    gulp.src('./dist/styles/css/ng-shopping-cart.css'),
    rename('ng-shopping-cart.min.css'),
    sourceMaps.init(),
    cleanCss({compatibility: '*'}),
    sourceMaps.write('.'),
    gulp.dest('./dist/styles/css'),
  ], cb);
});

gulp.task('styles:css', gulp.series('styles:css:compile', 'styles:css:min'));

gulp.task('styles:light:compile', (cb) => {
  pump([
    gulp.src('./src/styles/sass/lightweight.scss'),
    sass(),
    rename('ng-shopping-cart-light.css'),
    gulp.dest('./dist/styles/css'),
  ], cb);
});

gulp.task('styles:light:min', (cb) => {
  pump([
    gulp.src('./dist/styles/css/ng-shopping-cart-light.css'),
    rename('ng-shopping-cart-light.min.css'),
    sourceMaps.init(),
    cleanCss({compatibility: '*'}),
    sourceMaps.write('.'),
    gulp.dest('./dist/styles/css'),
  ], cb);
});

gulp.task('styles:light', gulp.series('styles:light:compile', 'styles:light:min'));

gulp.task('docs:generate', (cb) => {
  exec('npm run docs:generate', {windowsHide: true}, cb);
});

gulp.task('docs:compile', cb => {
  exec('npm run docs:build', {windowsHide: true}, cb);
});

gulp.task('docs:clean', () => {
  return git.checkout('gh-pages')
    .then(() => {
      return del(['*.js', '*.css', '*.html', './assets/*', '3rdpartylicenses.txt', '.nojekyll', 'favicon.ico']);
    });
});

gulp.task('docs:update', (cb) => {
  pump([
    gulp.src(['./docs-dist/**/*', './docs-dist/**/.*']),
    gulp.dest('./')
  ], cb);
});

gulp.task('docs:index', (cb) => {
  pump([
    gulp.src('./index.html'),
    rename('404.html'),
    gulp.dest('./'),
  ], cb);
});

gulp.task('docs:commit', () => {
  const msg = `Updating docs version ${pkg.version}`;
  return git.exec({args: 'add ./* -A'})
    .then(() => git.exec({args: `commit -a --message="${msg}"`}))
    .then(() => git.checkout('develop'))
});

gulp.task('docs:cleanup', () => {
  return del(['./docs-dist', './docs-build']);
});

gulp.task('docs', gulp.series(
  'docs:generate',
  'docs:compile',
  'docs:clean',
  'docs:update',
  'docs:index',
  'docs:commit',
  'docs:cleanup'
));

gulp.task('docs:dry', gulp.series(
  'docs:cleanup',
  'docs:generate',
  'docs:compile',
));

gulp.task('styles', gulp.series(
  'styles:clean',
  gulp.parallel(
    'styles:css',
    'styles:light',
    'styles:sass'
  ))
);

gulp.task('pack', cb => {
  return exec('npm run pack', {windowsHide: true}, cb);
});

gulp.task('default', gulp.series('pack', 'styles'));
