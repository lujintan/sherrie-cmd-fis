var fis = require('fis');
var fisCmdRelease = require('fis-command-release');
var fisCmdServer = require('fis-command-server');

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
};