//     .pipe(postcss([ autoprefixer() ]))
/*
   npm install --save-dev autoprefixer browser-sync gulp gulp-cssnano gulp-rename gulp-postcss gulp-sass imagemin notify
 */
//  for node sass issues: node node_modules/node-sass/scripts/install.js
// npm rebuild node-sass
/*
  gulp.task -- define task
  gulp.src -- point tofiles for use
  gulp.dest -- points to folder to output
  gulp.watch -- watch files and folders for changes
  , {
    since: lastRun(images)
  }
*/
/*
// "browserslist": [
//     "defaults",
//     "not IE 11",
//     "not IE_Mob 11",
//     "maintained node versions"
],
*/

const { src, dest, watch, series, lastRun, parallel } = require('gulp'),
    sass = require('gulp-sass'),
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename'),
    pump = require('pump'),
    cleanFiles = require('del'),
    imagemin = require('gulp-imagemin'),
    minHtml = require('gulp-htmlmin'),
    terser = require('gulp-terser'),
    browser = require('browser-sync').create(),
    postCss = require('gulp-postcss'),

    prefixer = require('autoprefixer');

function hello(cb) {
    console.log("Practicing Gulp 4");
    cb();
}
exports.hello = hello;

// for styles
/* steps
1. change to css
2. minify it
3. rename it
 */

function styles(cb) {
  pump(
    [
       src('dev/*.scss'),
       sass().on('error', sass.logError),
       postCss([prefixer()]),
       cssnano({
         reduceIdents:false,
         discardUnused: false
       }),
       rename({
         suffix: ".min"
       }),
       dest('public/'),
       browser.reload({
         stream: true
       })
    ],
    cb
  )
}
exports.styles = styles;

// minify html
function minifyHtml(cb) {

  pump([
      src('dev/*.html'),
      minHtml({
        collapseWhitespace: true
      }),
      dest('public/'),
      browser.reload({
        stream: true
      })
    ],
    cb
  )
}
exports.minifyHtml = minifyHtml;

function images(cb) {
   pump([
       src('dev/uploads/*'),
      //  imagemin(),
       dest('public/uploads'),
       browser.reload({
         stream: true
       })
     ],
     cb
   )
}
// images
exports.images = images

// javascript
function compressJs(cb) {
   pump([
       src('dev/*.js'),
       terser(),
       rename({
          extname : ".min.js"
       }),
       dest('public/'),
         browser.reload({
           stream: true
       })
   ],
   cb
   )
}
exports.compressJs = compressJs;

// this is a private function
function browserSync(cb) {
    browser.init({
       server: {
          baseDir: "public/"
       }
    }),
    cb
}
exports.browserSync = browserSync
// clean public folder, when using read false you would not need a dest()
async function clean(cb) {
     cleanFiles('public');
     cb
}

// @ignoreinitial removes the wait for a file to be changed before it is run
//  @ebents all monitors all events e.g add del e.t.c
function watchFiles(cb) {
    watch('dev/*.scss', {
        ignoreInitial: false,
        events: 'all'
      },
      styles
    );
    watch('dev/*.html', {
        ignoreInitial: false,
        events: 'all'
      },
      minifyHtml
    );
    watch('dev/uploads/*', {
        ignoreInitial: false,
        events: 'all'
      },
      imagemin
    );
    watch('dev/*.js', {
        ignoreInitial: false,
        events: 'all'
      },
      compressJs
    )
    cb
}
exports.watchFiles = watchFiles;

// default
exports.default = series(clean, series(styles, minifyHtml, images, compressJs), parallel(browserSync,watchFiles));



