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

		/* Partial file initialization */
		var glob = require('glob');
		var partialFiles = glob.sync(this.data.partials, {});
		partialFiles.forEach(function(path) {
			var filename = path.replace(/^.*[\\\/]/, '');
			var partialName = tidyPartialName(filename);
			var template = Handlebars.compile(grunt.file.read(path));
			Handlebars.registerPartial(partialName, template);
		});

		this.files.forEach(function(f) {
			/* Source file initialization */
			if (f.src.length !== 1) {
				grunt.fail.warn(new Error('Please use `expand: true` to specify the files to process.'));
			}
			var src = f.src[0];
			if (!grunt.file.exists(src)) {
				grunt.fail.warn(new Error('Source file "' + src + '" does not exist'));
			} else if (grunt.file.isDir(src)) {
				grunt.fail.warn(new Error('Source file "' + src + '" is directory.'));
			}

			/* Destination file initialization */
			if (isArray(f.dest)) {
				grunt.fail.warn(new Error('Please specify only one destination directory (not using an array).'));
			}
			if (!grunt.file.exists()) {
				grunt.file.mkdir(f.dest);
			}


			/* Compiling/templating */
			var html = grunt.file.read(src);
			var compiled = Handlebars.compile(html); // Returns a function that evaluates the template
			var finished = compiled({}); // Execute the function with a (currently) empty context
			grunt.file.write(f.dest, finished);
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