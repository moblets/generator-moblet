var fs = require('fs');
var q = require('q');

module.exports = function () {
  var deferred = q.defer();
  fs.readFile('tmp/package.json', function (err, data) {
    if (err) {
      deferred.reject('[ERROR] Error reading package.json');
    } else {
      data = JSON.parse(data);
      var dep = [];
      for (var depName in data.dependencies) {
        if ({}.hasOwnProperty.call(data.dependencies, depName)) {
          dep.push(depName);
        }
      }
      for (var devDepName in data.devDependencies) {
        if ({}.hasOwnProperty.call(data.devDependencies, devDepName)) {
          dep.push(devDepName);
        }
      }
      deferred.resolve(dep);
    }
  });
  return deferred.promise;
};
