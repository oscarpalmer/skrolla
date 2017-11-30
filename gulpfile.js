const
gulp   = require("gulp"),
babel  = require("gulp-babel"),
eslint = require("gulp-eslint"),
rename = require("gulp-rename"),
pump   = require("pump");

//  Task for finding errors and problems in Skrolla
gulp.task("eslint", () => {
  pump([
    gulp.src("src/skrolla.js"),
    eslint(),
    eslint.format(),
    eslint.failAfterError()
  ]);
});

//  Task for running Skrolla through Babel
gulp.task("babel", () => {
  pump([
    gulp.src("src/skrolla.js"),
    babel({ presets: ["env"] }),
    rename("skrolla.babel.js"),
    gulp.dest("dist")
  ]);
});