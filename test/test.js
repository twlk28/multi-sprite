var _ = require('lodash'),
    log = console.log;

module.exports = {
    setUp: function (callback) {
        this.cwd = process.cwd()
        this.CONST = {}
        this.CONST.SUFFIX_2X = '@2x'
        this.CONST.SUFFIX_3X = '@3x'
        this.options = {
            rootFontSize: 640/16,
            srcCss: 'test/web/src/css',
            srcImg: 'test/web/src/slice',
            destCss: 'test/web/dest/css',
            destImg: 'test/web/dest/img/sprite',
            'algorithm': 'binary-tree',
            'padding': 4,
            'engine': 'gm',
            'exportOpts': {
                'format': 'png',
                'quality': 90
            },
            successCB: function () {
                log('all done!')
            }
        }
        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    //testSprite: function (test) {
    //    var mod, input, output;
    //    mod = require('../lib/getConfig')
    //    input = {}
    //    output = mod(input).a
    //    test.equals(output, 1);
    //    test.done();
    //},
    //testCss: function (test) {
    //    var mod, input, output;
    //    mod = require('../lib/getConfig')
    //    input = {}
    //    output = mod(input).a
    //    test.equals(output, 1);
    //    test.done();
    //},
    //testMain: function (test) {
    //    var mod, input, output;
    //    mod = require('../lib/getConfig')
    //    input = {}
    //    output = mod(input).a
    //    test.equals(output, 1);
    //    test.done();
    //},
    testGetConfig: function (test) {
        var mod, input, output, output_expect;
        mod = require('../lib/getConfig')
        output = mod(this.options, this.CONST)
        output_expect = [
            {
                "engine": "gm",
                "algorithm": "binary-tree",
                "padding": 4,
                "dest": this.cwd+"/test/web/dest/img/sprite/s4game.png",
                "exportOpts": {
                    "format": "png",
                    "quality": 90
                },
                "src": [
                    this.cwd+"/test/web/src/slice/s4game/icon-play-disable.png",
                    this.cwd+"/test/web/src/slice/s4game/icon-play-live.png",
                    this.cwd+"/test/web/src/slice/s4game/icon-play.png",
                    this.cwd+"/test/web/src/slice/s4game/icon-play2.png",
                    this.cwd+"/test/web/src/slice/s4game/icon-vs.png"
                ]
            },
            {
                "engine": "gm",
                "algorithm": "binary-tree",
                "padding": 4,
                "dest": this.cwd+"/test/web/dest/img/sprite/s4game@2x.png",
                "exportOpts": {
                    "format": "png",
                    "quality": 90
                },
                "src": [
                    this.cwd+"/test/web/src/slice/s4game/icon-play-disable@2x.png",
                    this.cwd+"/test/web/src/slice/s4game/icon-play-live@2x.png",
                    this.cwd+"/test/web/src/slice/s4game/icon-play2@2x.png",
                    this.cwd+"/test/web/src/slice/s4game/icon-play@2x.png",
                    this.cwd+"/test/web/src/slice/s4game/icon-vs@2x.png"
                ]
            },
            {
                "engine": "gm",
                "algorithm": "binary-tree",
                "padding": 4,
                "dest": this.cwd+"/test/web/dest/img/sprite/s4game@3x.png",
                "exportOpts": {
                    "format": "png",
                    "quality": 90
                },
                "src": [
                    this.cwd+"/test/web/src/slice/s4game/icon-play-disable@3x.png",
                    this.cwd+"/test/web/src/slice/s4game/icon-play-live@3x.png",
                    this.cwd+"/test/web/src/slice/s4game/icon-play2@3x.png",
                    this.cwd+"/test/web/src/slice/s4game/icon-play@3x.png",
                    this.cwd+"/test/web/src/slice/s4game/icon-vs@3x.png"
                ]
            }
        ]
        test.equals(JSON.stringify(output), JSON.stringify(output_expect));
        test.done();
    }
};


