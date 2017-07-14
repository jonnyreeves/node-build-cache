var fs = require('fs');
var path = require('path');
var utils = require('./utils');

function link(opts, callback) {
	try {
		var cacheKey = utils.calculateBuildCacheKey(opts);
		var sourceCacheDir = path.join(opts.cacheDir, cacheKey);
		var targetDir = path.join(opts.workDir, 'node_modules');
	} catch (err) {
		return callback(new Error('failed to calculate build cache key: ' + err.message));
	}

	if (!utils.isDir(sourceCacheDir)) {
		console.log("no cache entry for checksum " + cacheKey);
		return callback(null);
	}

	if (utils.isDir(targetDir)) {
		return callback(new Error(targetDir + ' already exists, remove it first'));
	}

	fs.symlink(sourceCacheDir, targetDir, function (err) {
		if (err) {
			return callback(new Error('failed to link cahed modules into workDir: ' + err.message));
		}
		try {
			utils.updateLastUsed(sourceCacheDir);
		} catch (err) {
			return callback(new Error('failed to update last used file: ' + err.message));
		}
		console.log("linked cached modules, checksum " + cacheKey);
		return callback(null);
	});

};

module.exports = link;