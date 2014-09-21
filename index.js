var spritesmith = require('spritesmith'),
    fs = require('fs'),
    file = require('file'),
    path = require('path'),
    _ = require('lodash'),
    async = require('async'),
    gm = require('spritesmith/node_modules/gmsmith/node_modules/gm');

module.exports = function (options) {

    "use strict";

    // Export the SpriteMaker function

    var spritelist = [],
        imageReplaces = [],
        retinaSpritelist = [],
        retinaImageReplaces = [],
        csslist ,
        RETINA_SUFFIX = '@2x';

    // Normalize data
    var successCB = options.successCB || function(){};
    (function () {
        var spriteSrcDIR = options.srcImg,
            spriteDestDIR = options.destImg,
            cssSrcDIR = options.srcCss,
            cssDestDIR = options.destCss,
            exclude = [RETINA_SUFFIX, '.DS_Store', '.svn'],
            include = [RETINA_SUFFIX];

        file.mkdirsSync(cssDestDIR)
        file.mkdirsSync(spriteDestDIR)
        if(listDIR(spriteSrcDIR).length>0){
            spritelist = listDIR(spriteSrcDIR).map(function (itemDIR) {
                var src = listFileExclude(path.join(spriteSrcDIR, itemDIR), exclude).map(function(sliceFile){
                    return path.join(spriteSrcDIR, itemDIR, sliceFile);
                })
                var dest = path.join(spriteDestDIR, itemDIR)
                var sprite = setUpSpriteConfig(options, src, dest)
                return sprite;
            })

            retinaSpritelist = listDIR(spriteSrcDIR).filter(function(itemDIR){
                return !!listFileInclude(path.join(spriteSrcDIR, itemDIR), include).length
            }).map(function (itemDIR) {
                var src = listFileInclude(path.join(spriteSrcDIR, itemDIR), include).map(function(sliceFile){
                    return path.join(spriteSrcDIR, itemDIR, sliceFile);
                })
                var dest = path.join(spriteDestDIR, itemDIR+RETINA_SUFFIX)
                var sprite = setUpSpriteConfig(options, src, dest)
                return sprite
            })

        }
        if(listFileExclude(spriteSrcDIR, exclude).length>0){
            var src = listFileExclude(spriteSrcDIR, exclude).map(function(sliceFile){
                return path.join(spriteSrcDIR, sliceFile);
            })
            var dest = path.join(spriteDestDIR, 'sprite');
            var sprite = setUpSpriteConfig(options, src, dest)
            spritelist.push(sprite);
        }
        if(listFileInclude(spriteSrcDIR, include).length>0){
            var src = listFileInclude(spriteSrcDIR, include).map(function(sliceFile){
                return path.join(spriteSrcDIR, sliceFile);
            })
            var dest = path.join(spriteDestDIR, 'sprite'+RETINA_SUFFIX);
            var sprite = setUpSpriteConfig(options, src, dest)
            retinaSpritelist.push(sprite);
        }

        csslist = listFile(cssSrcDIR).map(function (itemFile) {
            var css = {};
            css.src = path.join(cssSrcDIR, itemFile);
            css.dest = path.join(cssDestDIR, itemFile);
            return css;
        });

        // utils
        function setUpSpriteConfig(dataObj, srcArr, destStr){
            var sprite = {}
            sprite.engine = dataObj.engine || 'auto';
            sprite.algorithm = dataObj.algorithm || 'top-down';
            sprite.padding = dataObj.padding || 0;
            sprite.exportOpts = dataObj.exportOpts || {};
            sprite.exportOpts.format = sprite.exportOpts.format || 'png';
            sprite.src = srcArr
            sprite.dest = path.join(destStr + '.'+sprite.exportOpts.format);
            return sprite
        }
        function isInclude(str, arr){
            var isFound = false
            if(arr){
                arr.forEach(function(e){
                    if(~str.indexOf(e)){isFound = true}
                })
            }
            return isFound
        }
        function listDIR (f) {
            var dir = fs.lstatSync(f).isDirectory() ? f : path.dirname(f)
            var list = fs.readdirSync(dir).filter(function (file) {
                return fs.statSync(path.join(dir, file)).isDirectory()
            })
            return list
        }
        function listFile (f) {
            var dir = fs.lstatSync(f).isDirectory() ? f : path.dirname(f)
            var list = fs.readdirSync(dir).filter(function (file) {
                return fs.statSync(path.join(dir, file)).isFile()
            })
            return list
        }
        function listFileExclude (f, exclude) {
            var dir = fs.lstatSync(f).isDirectory() ? f : path.dirname(f)
            var list = fs.readdirSync(dir).filter(function (file) {
                return fs.statSync(path.join(dir, file)).isFile() && !isInclude(file, exclude)
            })
            return list
        }
        function listFileInclude (f, include) {
            var dir = fs.lstatSync(f).isDirectory() ? f : path.dirname(f)
            var list = fs.readdirSync(dir).filter(function (file) {
                return fs.statSync(path.join(dir, file)).isFile() && isInclude(file, include)
            })
            return list
        }
    })();

    // Sprite creating function
    var _spriteSmithWrapper = function (config, callback) {
        var sprite = config.dest;
        delete config.sprite;
        spritesmith(config, function (err, result) {
            if (err) {
                console.error(err); process.abort();
                return callback(err);

            }else {
                fs.writeFile(sprite, result.image, { encoding: 'binary' })
                var tmpResult = result.coordinates;
                for (var key in result.coordinates) {
                    var newKey = path.join(process.cwd(), key).toLowerCase();
                    imageReplaces[ newKey ] = tmpResult[ key ];
                    imageReplaces[ newKey ].sprite = path.join(process.cwd(), sprite);

                }
                callback(false);
            }
        });
    };

    // SpriteRetina creating function
    var _retinaSpriteSmithWrapper = function (config, callback) {
        var sprite = config.dest;
        delete config.sprite;
        spritesmith(config, function (err, result) {
            if (err) { console.error(err); process.abort(); return callback(err); }
            fs.writeFile(sprite, result.image, { encoding: 'binary' })
            gm(sprite).size(function(err, size){
                if(err){ console.error(err); process.abort(); return;}
                if(size.width%2 ==1 || size.height%2 ==1){
//                        console.error('warning: all slices are not allow odd pix')
                }
                console.log('Done! [Created] -->'+sprite)
                var tmpResult = result.coordinates
                for (var key in result.coordinates) {
                    var newKey = path.join(process.cwd(), key).toLowerCase();
                    retinaImageReplaces[ newKey ] = tmpResult[ key ];
                    retinaImageReplaces[ newKey ].sprite = path.join(process.cwd(), sprite);
                    retinaImageReplaces[ newKey ].spriteWidth = size.width;
                }
                callback(false);
            })

        });

    };

    // Replace stylesheet
    var _insertSprites = function (css) {

        var retinaCssSnippetBanner = (function(){/*
         @media only screen and (-webkit-min-device-pixel-ratio: 1.5),only screen and (min--moz-device-pixel-ratio: 1.5),only screen and (min-resolution: 240dpi) {
         */}).toString().split('\n').slice(1, -1).join('\n');
        var retinaCssSnippetFooter = (function(){/*
         }
         */}).toString().split('\n').slice(1, -1).join('\n');
        var retinaCssSnippet = '';

        var regex = new RegExp('background-image:[\\s]?url\\(["\']?(?!http[s]?|/)([\\w\\d\\s!./\\-\\_@]*\\.[\\w?#]+)["\']?\\)', 'ig'),
            regex2 = new RegExp('(.*:hover.*)background-image:[\\s]?url\\(["\']?(?!http[s]?|/)([\\w\\d\\s!./\\-\\_]*\\.[\\w?#]+)["\']?\\)[^;]*;', 'ig'),
            dir = path.join(process.cwd(), path.dirname(css.src)),
            destDIR = path.join(process.cwd(), path.dirname(css.dest)),
            data = fs.readFileSync(css.src, 'utf8'),
            resources = _.uniq(data.match(regex)),
            pathToResource,
            absolutePath,
            newPath,
            img;

        if (resources !== null) {
            for (var i = 0; i < resources.length; i++) {
                pathToResource = resources[i].replace(regex, '$1');
                absolutePath = path.join(dir, pathToResource).toLowerCase();
                img = retinaImageReplaces[addSuffix(absolutePath, RETINA_SUFFIX)]
                if (img) {
                    newPath = path.relative(destDIR, img.sprite).replace(/\\/ig, '/')
                    var selectors = getSelectorsBySlice(data, pathToResource)
                    retinaCssSnippet += calcRetinaCssSnippet(selectors, img, newPath)
                    retinaImageReplaces[addSuffix(absolutePath, RETINA_SUFFIX)] = null
                }
                img = imageReplaces[ absolutePath ]
                if (img) {
                    newPath = path.relative(destDIR, img.sprite).replace(/\\/ig, '/')
                    data = calcCssSnippet(data, pathToResource, img, newPath)
                }
            }
        }
        // remove :hover class's background-image
        // data = data.replace(regex2, '$1 ');
        if(retinaCssSnippet.length>0){
            data += retinaCssSnippetBanner + retinaCssSnippet + retinaCssSnippetFooter
        }
        fs.writeFile(css.dest, data)

        // utils
        function addSuffix(url, suffix){
            if(!!~(url.indexOf(suffix))){return url}
            var dir = path.dirname(url)
            var newname = path.basename(url, path.extname(url))+suffix+path.extname(url)
            return path.join(dir, newname)
        }
        function calcCssSnippet(css, url, img, newPath){
            var regExp = new RegExp('background-image:[\\s]?url\\(["\']?'+url+'["\']?\\)', 'ig')
            var pos = 'background-image:url("' + newPath +'"); background-position: -'+img.x+'px -'+img.y+'px;'
            return css.replace(regExp, pos)
        }
        function calcRetinaCssSnippet(selectors, img, newPath){
            return selectors.map(function(selector){
                var snippet = selector+'{background-image:url("' + newPath +'");' +
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

    // Process starter
    async.eachSeries(retinaSpritelist, _retinaSpriteSmithWrapper, function(err){
        async.eachSeries(spritelist, _spriteSmithWrapper, function(err){
            for (var j = 0; j < csslist.length; j++) {
                _insertSprites(csslist[ j ]);
            }
            successCB();
        })
    })

};
