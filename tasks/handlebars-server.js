/*
 * https://github.com/connorbrinton/Resplend
 * 
 * Copyright (c) 2013 Connor Brinton
 * Licensed under the Apache license
 */

'use strict';

module.exports = function(grunt) {
	grunt.registerMultiTask('hbserver', 'Compile static HTML from handlebars templates on the server', function() {
		grunt.log.write('Compiling static HTML from handlebars templates...'+'\n');
		var Handlebars = require('handlebars');

		// grunt.log.writeln('%j', this.files);
		this.files.forEach(function(f) {
			/* Source file initialization */
			var src = f.src;
			// grunt.log.writeln('src.length: %d', src.length);
			if (src.length > 1) {
				var err = new Error('Please specify one directory to compile, not multiple files.');
				grunt.fail.warn(err);
			}
			src = src[0];
			if (!grunt.file.exists(src)) {
				var err = new Error('Source directory "' + src + '" does not exist');
				grunt.fail.warn(err);
			} else if (!grunt.file.isDir(src)) {
				var err = new Error('Source directory "' + src + '" is not a directory.');
				grunt.fail.warn(err);
			}

			/* Destination file initialization */
			var dest = f.dest;
			// grunt.log.writeln('dest: %j', dest);
			// grunt.log.writeln('dest.length: %d', dest.length);
			if (isArray(dest)) {
				var err = new Error('Please specify only one destination directory (not using an array).');
				grunt.fail.warn(err);
			}
			if (!grunt.file.exists()) {
				grunt.file.mkdir(dest);
			}

			/* Partial file initialization */
			var partials = f.partials;
			if (!grunt.file.exists(partials)) {
				var err = new Error('Partials directory "' + filepath + '" does not exist');
				grunt.fail.warn(err);
			} else if (!grunt.file.isDir(partials)) {
				var err = new Error('Partials directory "' + filepath + '" is not a directory.');
				grunt.fail.warn(err);
			}

			/* Loading partial files */
			grunt.file.recurse(partials, function(abspath, rootdir, subdir, filename) {
				var partialName = tidyPartialName(filename);
				var template = Handlebars.compile(grunt.file.read(abspath));
				Handlebars.registerPartial(partialName, template);
			});

			/* Compiling/templating */
			grunt.file.recurse(src, function(abspath, rootdir, subdir, filename) {
				if (endsWith(filename, '.html')) {
					var html = grunt.file.read(abspath);
					var compiled = Handlebars.compile(html); // Returns a function that evaluates the template
					var finished = compiled({}); // Execute the function with a (currently) empty context
					var targetFile = getTargetFile(dest, subdir, filename);
					grunt.file.write(targetFile, finished);
				}
			});
		});
	});
};

function isArray(o) {
	return Object.prototype.toString.call(o) === '[object Array]';
}

function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function tidyPartialName(filename) {
	var nameStart = filename.search('[^_]');
	nameStart = (nameStart !== -1 ? nameStart : 0);
	var nameEnd = filename.indexOf('.');
	nameEnd = (nameEnd !== -1 ? nameEnd : filename.length);
	return filename.substring(nameStart, nameEnd);
}

function getTargetFile(dest, subdir, filename) {
	var targetFile = dest;
	if (subdir !== undefined) {
		targetFile = targetFile + '/' + subdir;
	}
	targetFile = targetFile + '/' + filename;
	return targetFile;
}