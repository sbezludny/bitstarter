#!/usr/bin/env node

/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
   */

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
	var instr = infile.toString();
	if (!fs.existsSync(instr)) {
		console.log("%s does not exist. Exiting.", instr);
		process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
	}
	return instr;
};


var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile)).sort();
};

var checkHtmlFile = function(htmlfile, checks) {

	return check(fs.readFileSync(htmlfile), checks);
};

var checkUrl = function(url, checks, callback) {

	rest.get(url).on("complete", function(result) {
		callback(check(result, checks));
	});

};

var check = function(html, checks) {
	$ = cheerio.load(html);

	var out = {};
	for (var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};



var clone = function(fn) {
	// Workaround for commander.js issue.
	// http://stackoverflow.com/a/6772648
	return fn.bind({});
};

if (require.main == module) {
	program
		.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
		.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <url>', 'Url', true)
		.parse(process.argv);


	var checkJson;
	var checks = loadChecks(program.checks);
	if (program.url) {
		checkJson = checkUrl(program.url, checks, function(checkJson) {
			console.log(JSON.stringify(checkJson, null, "\t"));
		});
	} else if (program.file) {

		checkJson = checkHtmlFile(program.file, checks);
		console.log(JSON.stringify(checkJson, null, "\t"));
	}

	//http://fast-mountain-4665.herokuapp.com/

} else {
	exports.checkHtmlFile = checkHtmlFile;
}