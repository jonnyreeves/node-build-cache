var minimist = require('minimist');
var indent = require('wordwrap')(4, process.stdout.columns);
var os = require('os');
var utils = require('./lib/utils');
var archive = require('./lib/archive');
var link = require('./lib/link');
var prune = require('./lib/prune');

function die(message) {
	console.error('Error: ' + message);
	process.exit(1);
}

function printUsage() {
	console.log('node-build-cache - Symlink-based node_modules caching utility for speeding up subsequent `npm install` operations in a Continuous Integration environment.');
	console.log();
	console.log("Usage:");
	console.log("  node-build-cache [flags] <command>");
	console.log();
	
	console.log("Commands:");
	Object.keys(commands).forEach(function(cmdName) {
		console.log("  " + cmdName);
		console.log(indent(commands[cmdName].description));
		console.log();
	});

	console.log("Flags:");
	Object.keys(flags).forEach(function(flagName) {
		console.log("  " + flags[flagName].flagLiteral + "=<" + flags[flagName].defaultValue + ">");
		console.log(indent(flags[flagName].description));
		console.log();
	});
}

var commands = {
	'archive': {
		runFn: archive,
		description: 'Move the contents of the current package\'s node_module folder to the cache directory.  Exits with status code 0 if the modules are already cached.'
	},
	'link': {
		runFn: link,
		description: 'Symlink the current package\'s node_modules.  Exits with status code 0 if the modules are not cached.'
	},
	'prune': {
		runFn: prune,
		description: 'Removes cached node_modules older than the number of days specified by --cacheMaxAgeDays'
	}
}

var flags = {
	'cacheDir': {
		defaultValue: os.tmpDir(),
		flagLiteral: '--cacheDir',
		description: "Directory to store cached node_module folders."
	},
	'workDir': {
		defaultValue: process.cwd(),
		flagLiteral: '--workDir',
		description: "Working directory of the current package to link / archive."
	},
	'cacheMaxAgeDays': {
		defaultValue: 7,
		flagLiteral: '--cacheMaxAgeDays',
		description: "Directories older than this will be removed when pruned."
	}
}

var argv = minimist(process.argv.slice(2));

if (argv.help) {
	printUsage();
	process.exit(0);
}

if (argv._.length !== 1) {
	die("Invalid arguments: expected a single command but got: '" + argv._.join(" ") + "', see --help.");
}

var opts = {
	cacheDir: argv.cacheDir || os.tmpDir(),
	workDir: argv.workDir || process.cwd(),
	cacheMaxAgeDays: argv.cacheMaxAgeDays || 7,
	force: argv.force || false
};

if (!utils.isDir(opts.cacheDir)) {
	die("Invalid cacheDir: '" + opts.cacheDir + "' is not a directory");
}

cmd = commands[argv._[0]];
if (!cmd) {
	die("Invalid arguments: unknown command: '" + argv._[0] + "', see --help.");
}
cmd.runFn(opts, function (err) { 
	if (err) {
		console.error(err.message);
		process.exit(1);
	}
});