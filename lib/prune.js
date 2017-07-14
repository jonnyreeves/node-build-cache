var utils = require('./utils');
var rimraf = require('rimraf');

function prune(opts, callback) {
	var lastUsedMap = utils.getLastUsedTimeMap(opts);
	var maxAgeMs = opts.cacheMaxAgeDays * 60 * 24 * 1000;
	var pruneTime = Date.now() - maxAgeMs;

	console.log("pruning entries older than " + pruneTime);

	Object.keys(lastUsedMap)
		.forEach(function (fPath) {
			var lastUsedTime = lastUsedMap[fPath];
			if (pruneTime > lastUsedTime) {
				console.log("pruning cache entry " + fPath);
				rimraf.sync(fPath);
			}
		});

	return callback(null);
};

module.exports = prune;