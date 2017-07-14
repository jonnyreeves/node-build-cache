var path = require('path');
var fs = require('fs');
var utils = require('./utils');

function archive(opts, callback) {
	try {
		var sourceModulesDir = path.join(opts.workDir, 'node_modules');
		var cacheKey = utils.calculateBuildCacheKey(opts);
		var targetCacheDir = path.join(opts.cacheDir, cacheKey);
	} catch (e) {
		return callback(new Error('failed to calculate build cache key: ' + e.message));
	}

	if (utils.isDir(targetCacheDir)) {
			console.log("cache entry already exists for checksum " + cacheKey);
			return callback(null);
		}

	console.log("archiving " + sourceModulesDir);
	fs.rename(sourceModulesDir, targetCacheDir, function (err) {
		if (err) {
			return callback(new Error('failed to move node_modules to cache: ' + err.message));
		}
		try {
			utils.updateLastUsed(targetCacheDir);
		} catch (err) {
			return callback(new Error('failed to update last used file: ' + err.message));
		}
		console.log("created cache entry for checksum " + cacheKey);
		return callback(null);
	});
}

module.exports = archive;