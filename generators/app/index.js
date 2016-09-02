'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var mv = require('mv');
var fs = require('fs');

// var normalize = require('./helpers/normalize-helper');
var clone = require('./helpers/clone-helper');
var getDependencies = require('./helpers/dependencies-helper');
var dependencies = {};

module.exports = yeoman.Base.extend({
  initializing: function () {
    this.log(yosay(
      'Welcome to ' + chalk.blue('Moblets\'') + ' moblet generator!\n\n' +
      'Press CONTROL + c to stop the execution'
    ));
  },

  prompting: function () {
    var prompts = [
      // {
      //   type: 'input',
      //   name: 'mobletName',
      //   message: 'What is the name of your moblet?',
      //   default: 'my-first-moblet',
      //   filter: function (name) {
      //     return normalize(name);
      //   }
      // },
      {
        type: 'list',
        name: 'baseMoblet',
        message: 'What moblet do you want to use as base?',
        choices: [
          'Empty moblet',
          'Map moblet',
          'List moblet',
          'Fidelity card moblet'
        ],
        default: 0
      },
      {
        type: 'confirm',
        name: 'mForgeInstall',
        message: 'Do you want to install m-forge?',
        default: false
      }
    ];

    return this.prompt(prompts)
      .then(function (answers) {
        this.answers = answers;
      }
      .bind(this)
    );
  },

  configuring: function () {
    var done = this.async();
    // var mobletName = this.answers.mobletName;
    var mobletName = 'tmp';
    var baseMobletLabel = this.answers.baseMoblet;
    var baseMoblet = '';

    switch (baseMobletLabel) {
      case 'Empty moblet':
        baseMoblet = 'm-moblet-base';
        break;
      case 'Map moblet':
        baseMoblet = 'm-map';
        break;
      case 'List moblet':
        baseMoblet = 'm-simple-list';
        break;
      case 'Fidelity card moblet':
        baseMoblet = 'm-fidelity-card';
        break;
      default:
        baseMoblet = 'm-moblet-base';
        break;
    }
    var gitUrl = 'https://github.com/moblets/' + baseMoblet + '.git';

    console.log(chalk.blue('\n[BEGIN] Cloning ' + baseMobletLabel));
    clone(gitUrl, mobletName)
      .then(function () {
        console.log(
          chalk.green('[SUCCESS] Cloning ' + baseMobletLabel));

        return getDependencies(mobletName);
      })
      .then(function (deps) {
        dependencies = deps;
        done();
      })
      // .then(function () {
      // })
      .fail(function (err) {
        console.log(chalk.red(err));
      });
  },
  copy: function () {
    console.log(chalk.blue('\n[BEGIN] Copying files'));
    // var mobletName = this.answers.mobletName;
    var mobletName = 'tmp';
    var successCount = 0;
    var error = function (err) {
      if (err) {
        console.log(chalk.red('\n[ERROR] Copying files'));
      } else {
        successCount++;
        if (successCount === 7) {
          console.log(chalk.green('[SUCCESS] Copying files'));
        }
      }
    };

    mv(mobletName + '/.eslintrc.yml', '.eslintrc.yml', error);
    mv(mobletName + '/.gitignore', '.gitignore', error);
    mv(mobletName + '/LICENSE', 'LICENSE', error);
    mv(mobletName + '/moblet', 'moblet', error);
    mv(mobletName + '/package.json', 'package.json', error);
    mv(mobletName + '/readme.md', 'readme.md', error);
    mv(mobletName + '/server', 'server', error);
    mv(mobletName + '/spec', 'spec', error);
  },

  install: function () {
    console.log(chalk.blue('\n[BEGIN] Installing dependencies'));
    this.npmInstall(dependencies);
    if (this.answers.mForgeInstall) {
      this.npmInstall(dependencies);
    }
  },

  end: function () {
    console.log(chalk.green('[SUCCESS] Installing dependencies'));
    // var mobletName = this.answers.mobletName;
    var mobletName = 'tmp';
    var deleteFolderRecursive = function (path) {
      if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
          var curPath = path + '/' + file;
          if (fs.lstatSync(curPath).isDirectory()) { // recurse
            deleteFolderRecursive(curPath);
          } else { // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(path);
      }
    };
    deleteFolderRecursive(mobletName);
  }
});
