var fis = require('fis');
var fisCmdRelease = require('fis-command-release');
var fisCmdServer = require('fis-command-server');
var fsEnhance = require('fs-enhance');
var fs = require('fs');
var path = require('path');
var sys = require('sys');
var colors = require('colors');
var watch = require('watch');
var exec = require('child_process').exec;
var Q = require('q');

var _execPromise = function(cmd){
    var deferred = Q.defer();
    exec(cmd, function(error, stdout, stderr){
        deferred.resolve({
            error: error, 
            stdout: stdout, 
            stderr: stderr
        });
    });
    return deferred.promise;
};

var _arrForInPromise = function(arr, callback, index, deferred){
    var index = index || 0;
    var deferred = deferred || Q.defer();

    if (typeof arr[index] !== 'undefined'){
        var cbReturn = callback(arr[index], index);

        if (cbReturn && !!cbReturn.then) {  //if return a promise object
            cbReturn.then(function(){
                _arrForInPromise(arr, callback, ++index, deferred);
            });
        } else if (cbReturn === false) {  //stop traversaling array when return false
            deferred.resolve();
        } else {  //traversal the next item
            _arrForInPromise(arr, callback, ++index, deferred);
        }
    } else {
        deferred.resolve();
    }

    return deferred.promise;
};

var _releaseExec = function(execArr) {
    return _arrForInPromise(execArr, function(cmdInfo, index) {
        var cmd = cmdInfo.cmd;
        var root = cmdInfo.realPath;
        return _execPromise(cmd).then(function(execInfo){
            var error = execInfo.error; 
            var stdout = execInfo.stdout;
            var stderr = execInfo.stderr;

            if (error !== null || stderr) {
                console.log('exec error: ' + error);
            } else {
                console.log(('Folder ' + root + ' compiling...').yellow);
                sys.print(stdout);
                console.log(('Folder ' + root + ' relesed!').green);
            }
            if (stderr) {
                sys.print(('Folder ' + root + ' compile Error: \n' + stderr).red);
            }
        });
    });
};

module.exports = function(PluginAPI) {
    //load the default fis configuration
    fis.config.merge(require('./fis-conf-default.js'));

    //register the fis release command
    PluginAPI.register('release', 'fis release command', function(commander) {
        fisCmdRelease.register(commander);
    });

    //register the fis server command
    PluginAPI.register('server', 'fis server command', function(commander) {
        fisCmdServer.register(commander);
    });
        
    //register the releaseall command for releasing all modules in this folder
    PluginAPI.register('releaseall', 'release all modules', [{
            sample: '-d, --dest <names>',
            desc: 'release output destination',
            type: String,
            defVal: 'preview'
        }, {
            sample: '-m, --md5 [level]',
            desc: 'md5 release option',
            type: Number
        }, {
            sample: '-D, --domains',
            desc: 'add domain name',
            type: Boolean,
            defVal: false
        }, {
            sample: '-l, --lint',
            desc: 'with lint',
            type: Boolean,
            defVal: false
        }, {
            sample: '-t, --test',
            desc: 'with unit testing',
            type: Boolean,
            defVal: false
        }, {
            sample: '-o, --optimize',
            desc: 'with optimizing',
            type: Boolean,
            defVal: false
        }, {
            sample: '-p, --pack',
            desc: 'with package',
            type: Boolean,
            defVal: true
        }, {
            sample: '-w, --watch',
            desc: 'monitor the changes of project'
        }, {
            sample: '-L, --live',
            desc: 'automatically reload your browser'
        }, {
            sample: '-c, --clean',
            desc: 'clean compile cache',
            type: Boolean,
            defVal: false
        }, {
            sample: '-u, --unique',
            desc: 'use unique compile caching',
            type: Boolean,
            defVal: false
        }, {
            sample: '-c, --clean',
            desc: 'clean compile cache',
            type: Boolean,
            defVal: false
        }, {
            sample: '--verbose',
            desc: 'enable verbose output',
            type: Boolean,
            defVal: false
        }], function(commander, proArg) {
        var realArg = proArg;
        var isWatch = false;

        for (var i = 0, len = realArg.length ; i < len ; i++) {
            var arg = realArg[i];
            if (arg === 'releaseall') {
                realArg[i] = 'release';
            } else if (/^-\w*w\w*$/.test(arg)) {
                isWatch = true;
                realArg[i] = arg.replace('w', '');
            } else if (arg === '--watch') {
                isWatch = true;
                realArg[i] = '';
            }
        }


        realArg.push('--root');
        realArg.push('');

        var _release = function(){
            var _execArr = [];
            fsEnhance.readDir('.', function(opt){
                var realPath = opt.path;
                var isDir = !opt.type;

                if (isDir) {
                    if (fs.existsSync(path.join(realPath, 'fis-conf.js'))) {
                        realArg[realArg.length - 1] = realPath;
                        var cmd = realArg.join(' ');
                        _execArr.push({
                            cmd: cmd,
                            realPath: realPath
                        });
                    }
                }
            });

            return _releaseExec(_execArr);
        };
        _release().then(function(){
            if (isWatch) {
                console.log('watching...');
                watch.watchTree('.', function(f, curr, prev){
                    if (typeof f === 'string') {
                        var fDir = path.dirname(f);
                        console.log('File [' + f.blue + '] changed');
                        
                        while (!/\.\./.test(fDir)) {
                            if (fs.existsSync(path.join(fDir, 'fis-conf.js'))) {
                                realArg[realArg.length - 1] = fDir;
                                _releaseExec([{
                                    cmd: realArg.join(' '), 
                                    realPath: fDir
                                }]).then(function(){
                                    console.log('watching...');
                                });
                                break;
                            } else {
                                fDir = path.join(fDir, '..');
                            }
                        }
                    }
                });
            }
        });
    });
};