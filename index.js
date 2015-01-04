var spritesmith = require('spritesmith'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    glob = require('glob'),
    async = require('async'),
    gm = require('spritesmith/node_modules/gmsmith/node_modules/gm');

// Export the SpriteMaker function
module.exports = function (options) {
    "use strict";

    var configItems = [],
        csslist = [],
        imageReplaces = {},
        RETINA_2X_SUFFIX = '@2x',
        RETINA_3X_SUFFIX = '@3x';

    // Normalize data
    var successCB = options.successCB || function(){},
        spriteSrcDIR = options.srcImg,
        spriteDestDIR = options.destImg,
        cssSrcDIR = options.srcCss,
        cssDestDIR = options.destCss;

    // 1. Prepare spirteConfigData
    (function () {
        configItems = configItems.concat(dir2config('./'))
        glob.sync('./*/', {
            cwd: path.join(process.cwd(), spriteSrcDIR)
        }).forEach(function (subdir) {
            configItems = configItems.concat(dir2config(subdir))
        })
        configItems = _.filter(configItems, function(e){
            return !_.isEmpty(e)
        })

        csslist = glob.sync('./*.css', {
            cwd: path.join(process.cwd(), cssSrcDIR)
        }).map(function (itemFile) {
            var css = {};
            css.src = path.join(cssSrcDIR, itemFile)
            css.dest = path.join(cssDestDIR, itemFile)
            return css
        })

        // utils
        function dir2config(dir) {
            var _configItems = []
            var _cwdName = path.resolve(dir) === process.cwd()? 'global': path.basename(dir)
            var _files = glob.sync(dir+'+(*.png|*.jpg|*.gif)', {
                cwd: path.join(process.cwd(), spriteSrcDIR),
                nodir: true
            })
            if(_files.length === 0){return _configItems}

            var splitRst = splitByRule(_files)
            _configItems = splitRst.map(function (e) {
                var _sprite_suffix = (e.dest==='@1x'?'':e.dest)
                var _sprite_dest = path.join(process.cwd(), spriteDestDIR, _cwdName + _sprite_suffix)
                var _sprite_src = e.src.map(function (ee) {
                    return path.join(process.cwd(), spriteSrcDIR, ee)
                })
                return formatSpriteSmithCfg(_sprite_dest, _sprite_src)
            })
            return _configItems
        }

        function splitByRule(slices) {
            var arr = [
                {
                    "dest": "@1x",
                    "src" : _.filter(slices, function (e) {
                        return !~e.indexOf('@')
                    })
                },
                {
                    "dest": RETINA_2X_SUFFIX,
                    "src" : _.filter(slices, function (e) {
                        return !!~e.indexOf(RETINA_2X_SUFFIX)
                    })
                },
                {
                    "dest": RETINA_3X_SUFFIX,
                    "src" : _.filter(slices, function (e) {
                        return !!~e.indexOf(RETINA_3X_SUFFIX)
                    })
                }
            ]
            arr = _.filter(arr, function (e) {
                return !_.isEmpty(e.src)
            })
            return arr
        }

        function formatSpriteSmithCfg(_dest,_src) {
            var exportImageFormat = (options.exportOpts && options.exportOpts.format) || 'png';
            return {
                "engine": options.engine || "gm",
                "algorithm": options.algorithm || 'top-down',
                "padding": options.padding || 0,
                "dest": _dest+'.'+exportImageFormat,
                "exportOpts": {
                    "format": exportImageFormat,
                    "quality": (options.exportOpts && options.exportOpts.quality) || 90
                },
                "src": _src
            }
        }

    })();

    // 2. Sprite creating function
    var _spriteSmithWrapper = function (config, callback) {
        var sprite = config.dest;
        delete config.sprite;
        spritesmith(config, function (err, result) {
            if (err) { console.error(err); process.abort(); return callback(err); }
            fs.writeFile(sprite, result.image, { encoding: 'binary' })
            gm(sprite).size(function(err, size){
                if(err){ console.error(err); process.abort(); return;}
                if(size.width%2 ==1 || size.height%2 ==1){
//                        console.error('warning: sprite's width is odd pix')
                }
                console.log('[Created] -->'+sprite)
                var tmpResult = result.coordinates
                for (var key in result.coordinates) {
                    var newKey = path.relative(cssSrcDIR, key).toLowerCase();
                    imageReplaces[ newKey ] = tmpResult[ key ];
                    imageReplaces[ newKey ].sprite = path.relative(path.join(process.cwd(), cssDestDIR), sprite).replace(/\\/ig, '/');
                    imageReplaces[ newKey ].spriteWidth = size.width;
                }
                callback(false);
            })

        });

    };

    // 3. Replace stylesheet
    var _insertSprites = function (css) {

        var cssSnippetBanner2x = (function(){/*

         @media only screen and (-webkit-min-device-pixel-ratio: 1.5),only screen and (min--moz-device-pixel-ratio: 1.5),(min-resolution: 1.5dppx),only screen and (min-resolution: 240dpi) {
         */}).toString().split('\n').slice(1, -1).join('\n');
        var cssSnippetFooter2x = (function(){/*
         }
         */}).toString().split('\n').slice(1, -1).join('\n');
        var cssSnippet2x = '';


        var cssSnippetBanner3x = (function(){/*

         @media only screen and (min-device-width : 414px) and (max-device-width : 736px) and (-webkit-min-device-pixel-ratio : 3) {
         */}).toString().split('\n').slice(1, -1).join('\n');
        var cssSnippetFooter3x = (function(){/*
         }
         */}).toString().split('\n').slice(1, -1).join('\n');
        var cssSnippet3x = '';

        var regex = new RegExp('background-image:[\\s]?url\\(["\']?(?!http[s]?|/)([\\w\\d\\s!./\\-\\_@]*\\.[\\w?#]+)["\']?\\)', 'ig'),
            data = fs.readFileSync(css.src, 'utf8'),
            resources = _.uniq(data.match(regex)),
            pathToResource, img, selectors;

        if (resources !== null) {
            for (var i = 0; i < resources.length; i++) {
                pathToResource = resources[i].replace(regex, '$1')
                selectors = ''

                img = imageReplaces[addSuffix(pathToResource, RETINA_3X_SUFFIX)]
                if (img) {
                    selectors = selectors || getSelectorsBySlice(data, pathToResource)
                    cssSnippet3x += calcRetinaCssSnippet(selectors, img)
                }
                img = imageReplaces[addSuffix(pathToResource, RETINA_2X_SUFFIX)]
                if (img) {
                    selectors = selectors || getSelectorsBySlice(data, pathToResource)
                    cssSnippet2x += calcRetinaCssSnippet(selectors, img)
                }
                img = imageReplaces[ pathToResource ]
                if (img) {
                    data = calcCssSnippet(data, pathToResource, img)
                }
            }
        }
        if(cssSnippet2x.length>0){
            data += cssSnippetBanner2x + cssSnippet2x + cssSnippetFooter2x
        }
        if(cssSnippet3x.length>0){
            data += cssSnippetBanner3x + cssSnippet3x + cssSnippetFooter3x
        }
        fs.writeFile(css.dest, data)

        // utils
        function addSuffix(url, suffix){
            if(!!~(url.indexOf(suffix))){return url}
            var dir = path.dirname(url)
            var newname = path.basename(url, path.extname(url))+suffix+path.extname(url)
            return path.join(dir, newname)
        }
        function calcCssSnippet(css, url, img){
            var regExp = new RegExp('background-image:[\\s]?url\\(["\']?'+url+'["\']?\\)', 'ig')
            var pos = 'background-image:url("' + img.sprite +'"); background-position: -'+img.x+'px -'+img.y+'px'
            return css.replace(regExp, pos)
        }
        function calcRetinaCssSnippet(selectors, img){
            return selectors.map(function(selector){
                var snippet = selector+'{background-image:url("' + img.sprite +'");' +
                    'background-position: -'+img.x/2+'px -'+img.y/2+'px; background-size: '+ img.spriteWidth/2 +'px; }'
                return snippet
            }).join('')
        }
        function getSelectorsBySlice(css, url){
            var regStr = '([\\#\\.\\w\\d\\s-_\\:\\,]*)\\{[^}]+'+url
            var regExp = new RegExp(regStr, 'ig')
            var matches = css.match(regExp).map(function(e){
                return e.replace(regExp, '$1')
            })
            return matches
        }
        return;
    };

    // 0. main
    async.eachSeries(configItems, _spriteSmithWrapper, function(err){
        for (var j = 0; j < csslist.length; j++) {
            _insertSprites(csslist[ j ]);
        }
        successCB();
    })
};
