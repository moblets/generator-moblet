var gitClone = require('git-clone');
var q = require('q');

var clone = function (gitUrl, path) {
  var deferred = q.defer();
  gitClone(gitUrl, path, function (err) {
    if (err) {
      deferred.reject('[ERROR] Error cloning ' + gitUrl);
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
};
module.exports = clone;
