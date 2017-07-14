var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var lastUsedFilename = ".lastused";

function calculateBuildCacheKey(opts) {	
	var contents = fs.readFileSync(path.join(opts.workDir, 'package.json'));
	var shasum = crypto.createHash('sha256');
	shasum.update(contents);
	return shasum.digest('hex');
}

function isDir(fPath) {
	try {
		return fs.lstatSync(fPath).isDirectory();
	} catch (e) {
		return false;
	}
}

function getLastUsedTimeMap(opts) {
	return fs.readdirSync(opts.cacheDir)
		.map(function (childName) { 
			return path.join(opts.cacheDir, childName);
		})
		.filter(isDir)
		.reduce(function (acc, fPath) {
			acc[fPath] = fs.readFileSync(path.join(fPath, lastUsedFilename)).toString('utf8');
			return acc;
		}, {});
}

function updateLastUsed(targetCacheDir) {
	fs.writeFileSync(path.join(targetCacheDir, lastUsedFilename), Date.now());
}

module.exports = {
	calculateBuildCacheKey: calculateBuildCacheKey,
	isDir: isDir,
	getLastUsedTimeMap: getLastUsedTimeMap,
	updateLastUsed: updateLastUsed
}