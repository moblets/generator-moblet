'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var fs = require('fs-extra');

var str = require('./helpers/string-helper');
var files = require('./helpers/files-helper');
var clone = require('./helpers/clone-helper');
var getDependencies = require('./helpers/dependencies-helper');

var dependencies = {};
var baseMoblet = '';

module.exports = yeoman.Base.extend({
  initializing: function () {
    this.log(yosay(
      'Welcome to ' + chalk.blue('Moblets\'') + ' moblet generator!\n\n' +
      'Press CONTROL + c to stop the execution'
    ));
  },

  prompting: function () {
    var prompts = [
      {
        type: 'input',
        name: 'mobletName',
        message: 'What is the name of your moblet?',
        default: 'my-first-moblet',
        filter: function (name) {
          return str.normalize(name);
        }
      },
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
        message: 'Do you want to install m-forge globaly? It\'s needed to test your moblet locally.',
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
    var baseMobletLabel = this.answers.baseMoblet;
    var mobletName = this.answers.mobletName;

    switch (baseMobletLabel) {
      case 'Empty moblet':
        baseMoblet = 'm-moblet-base';
        break;
      case 'Map moblet':
        baseMoblet = 'm-map';
        break;
      case 'Simple List moblet':
        baseMoblet = 'm-simple-list';
        break;
      case 'List moblet':
        baseMoblet = 'm-list';
        break;
      case 'Fidelity card moblet':
        baseMoblet = 'm-fidelity-card';
        break;
      default:
        baseMoblet = 'm-moblet-base';
        break;
    }
    var gitUrl = 'https://github.com/moblets/' + baseMoblet + '.git';

    console.log(chalk.blue('\n Cloning ' + baseMobletLabel + ' from GitHub'));
    clone(gitUrl)
      .then(function () {
        console.log(chalk.blue(' Converting content'));
        return files.replaceContent(baseMoblet, mobletName);
      })
      .then(function () {
        console.log(chalk.blue(' Converting package.json'));
        return files.removeContentFromPackageJson();
      })
      .then(function () {
        console.log(chalk.blue(' Renaming files'));
        return files.rename(baseMoblet, mobletName);
      })
      .then(function () {
        console.log(chalk.blue(' Reading dependencies'));
        return getDependencies();
      })
      .then(function (deps) {
        dependencies = deps;
        done();
        return true;
      })
      .then(function () {
        console.log(chalk.blue(' Moving files'));
        return files.moveFiles();
      })
      .then(function () {
        console.log(chalk.blue(' Deleting temporary folder'));
        fs.removeSync('tmp');
      })
      .fail(function (err) {
        console.log(chalk.red(err));
      });
  },

  dependencies: function () {
    console.log(chalk.blue(' Installing npm dependencies\n'));
    this.npmInstall(dependencies);
    if (this.answers.mForgeInstall) {
      this.npmInstall(['m-forge'], {global: true});
    }
  },

  end: function () {
    console.log(chalk.blue('\n                 #########'));
    console.log(chalk.blue('            ###################'));
    console.log(chalk.blue('         #########################'));
    console.log(chalk.blue('       #############################'));
    console.log(chalk.blue('      ###############################'));
    console.log(chalk.blue('     #################################'));
    console.log(chalk.blue('     #################################'));
    console.log(chalk.blue('     # ') +
                chalk.green('Finished creating the moblet!') +
                chalk.blue(' #'));
    console.log(chalk.blue('     #################################'));
    console.log(chalk.blue('     ################################'));
    console.log(chalk.blue('     ###############################'));
    console.log(chalk.blue('     #############################'));
    console.log(chalk.blue('     ##########################'));
    console.log(chalk.blue('     #####################\n'));
  }

});
