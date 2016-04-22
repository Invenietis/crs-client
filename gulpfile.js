var gulp = require('gulp'),
    concat = require('gulp-concat'),
    ts = require('gulp-typescript'),
    merge = require('merge2'),
    runSequence = require('run-sequence'),
    sourcemaps = require('gulp-sourcemaps'),
    tsProject = ts.createProject('./ts/tsconfig.json'),
    typedoc = require('gulp-typedoc'),
    exec = require('child_process').exec,
    webpack = require('webpack-stream');

gulp.task('concat:bundle', function(){
    return gulp.src(['./dist/ck-crs.js', './bundling/ck-crs.footer.js'])
        .pipe(concat('ck-crs.js'))
        .pipe(gulp.dest('./dist'))
});

gulp.task("doc", function(){
    return gulp
        .src(["./ts/src/**/*.ts"])
		.pipe(typedoc({ 
			module: "commonjs", 
			target: "es5",
			emitDecoratorMetadata: true,
            experimentalDecorators: true,
            
			// Output options (see typedoc docs) 
			out: "./doc", 
 
			// TypeDoc options (see typedoc docs) 
			ignoreCompilerErrors: true,
			version: true,
		}));
});

gulp.task('compile', function(){
     var tsResult = gulp.src(['./ts/**/*.ts', './typings/main.d.ts'])
        .pipe(sourcemaps.init())
		.pipe(ts(tsProject));
	  
     return merge([
        tsResult.dts.pipe(gulp.dest('.')),
        tsResult.js
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('.'))
    ]);
});

gulp.task('bundle:definitions', function(){
    return gulp.src('./bundling/ck-crs.d.ts')
            .pipe(gulp.dest('./dist'));
});

gulp.task('bundle', function(){
    return gulp.src(['./ts/core.ts'])
            .pipe(webpack(require('./webpack.config.js')))
            .pipe(gulp.dest('./dist'));
});

gulp.task('build', function(cb){
    runSequence(['compile', 'bundle'], 'concat:bundle', cb);
});

gulp.task('watch',['compile'], function(){
    return gulp.watch(['./ts/**/*.ts','!./ts/typings/**/*.ts'], ['compile']);
});