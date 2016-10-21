var fs = require('fs-extra');
var q = require('q');
var str = require('./string-helper');

var files = {
  replaceContent: function (original, mobletName) {
    var deferred = q.defer();
    var successCount = 0;

    var regexHyphen = new RegExp(original, 'g');

    var regexCammel = new RegExp(str.convertToCammelCase(original), 'g');
    var mobletNameCammel = str.convertToCammelCase(mobletName);

    var respond = function (err) {
      successCount++;
      if (err) {
        deferred.reject('[ERROR] Error renaming code');
      } else if (successCount === 3) {
        deferred.resolve();
      }
    };

    var replace = function (file) {
      fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
          deferred.reject('[ERROR] Error reading file');
        }

        data = data.replace(regexHyphen, mobletName);
        var result = data.replace(regexCammel, mobletNameCammel);

        fs.writeFile(file, result, 'utf8', respond);
      });
    };

    replace('tmp/moblet/' + original + '.js');

    replace('tmp/moblet/' + original + '.less');

    replace('tmp/moblet/' + original + '.html');

    replace('tmp/package.json');

    return deferred.promise;
  },

  removeContentFromPackageJson: function () {
    var deferred = q.defer();

    var pack = JSON.parse(fs.readFileSync('tmp/package.json').toString());
    delete pack.homepage;
    delete pack.repository;
    delete pack.author;
    pack.version = '0.0.1';
    fs.writeFile(
      'tmp/package.json',
      JSON.stringify(pack, null, 2),
      function () {
        deferred.resolve();
      }
    );
    return deferred.promise;
  },

  rename: function (org, dst) {
    var deferred = q.defer();
    var successCount = 0;
    org = 'tmp/moblet/' + org;
    dst = 'tmp/moblet/' + dst;

    var respond = function (err) {
      successCount++;

      if (err) {
        deferred.reject('[ERROR] Error renaming files');
      } else if (successCount === 3) {
        deferred.resolve();
      }
    };

    fs.move(org + '.js', dst + '.js', respond);
    fs.move(org + '.html', dst + '.html', respond);
    fs.move(org + '.less', dst + '.less', respond);

    return deferred.promise;
  },

  moveFiles: function () {
    var deferred = q.defer();
    var successCount = 0;

    var respond = function (err) {
      successCount++;
      if (err) {
        deferred.reject('[ERROR] Error copying files');
      } else if (successCount === 8) {
        deferred.resolve();
      }
    };
    fs.move('tmp/.eslintrc.yml', '.eslintrc.yml', respond);
    fs.move('tmp/.gitignore', '.gitignore', respond);
    fs.move('tmp/LICENSE', 'LICENSE', respond);
    fs.move('tmp/package.json', 'package.json', respond);
    fs.move('tmp/readme.md', 'readme.md', respond);

    fs.move('tmp/moblet', 'moblet', respond);
    fs.move('tmp/server', 'server', respond);
    fs.move('tmp/spec', 'spec', respond);

    return deferred.promise;
  }
};
module.exports = files;
