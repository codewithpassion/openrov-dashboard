var EventEmitter = require('events').EventEmitter, cp = require('child_process'), Lazy = require('lazy');
var Dpkg = function () {
  var dpkg = new EventEmitter();


  dpkg.packagesAsync = function (packageName, callback) {
    var dpkgProcess = cp.spawn('dpkg', [
        '-l',
        packageName
      ]);
    var input = Lazy(dpkgProcess.stdout).lines.map(String).skip(5).filter(function (line) {
      return line !== '0';
    }).map(function (line) {
      var fields = line.trim().split(/\s+/, 3);
      return {
        package: fields[1],
        version: fields[2]
      };
    });
    var stdErr = '';
    Lazy(dpkgProcess.stderr).lines.map(String).join(function(items) { stdErr = items.join('\n') });
    input.join(function(items) {
      callback(items); });
  };
  dpkg.install = function (path) {
    var dpkgProcess = cp.spawn('dpkg', [
        '-i',
        path
      ]);
    dpkgProcess.stderr.on('data', function (data) {
      console.log(data.toString());
      dpkg.emit('software-install-status', data.toString());
    });
    dpkgProcess.stdout.on('data', function (data) {
      console.log(data.toString());
      dpkg.emit('software-install-status', data.toString());
    });
  };
  return dpkg;
};
module.exports = Dpkg;