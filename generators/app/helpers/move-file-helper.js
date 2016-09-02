var fs = require('fs');
var q = require('q');

module.exports = function (path) {
  var is = fs.createReadStream(path);
  var os = fs.createWriteStream('destination_file');

  util.pump(is, os, function () {
    fs.unlinkSync('source_file');
  });
  return deferred.promise;
};
