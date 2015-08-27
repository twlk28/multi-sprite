var path = require('path'),
    file = require('file'),
    _ = require('lodash'),
    glob = require('glob')

var CONST = require('./CONST')

module.exports = function (options) {
    //var result = {rootFontSize: options.rootFontSize, items: []}
    //var configItems = result.items

    var configItems = []

    var spriteSrcDIR = options.srcImg,
        spriteDestDIR = options.destImg,
        cssSrcDIR = options.srcCss,
        cssDestDIR = options.destCss;

    file.mkdirsSync(cssDestDIR)
    file.mkdirsSync(spriteDestDIR)


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
            var _sprite_format = path.extname(_sprite_src[0]).substr(1)
            return formatSpriteSmithCfg(_sprite_dest, _sprite_src, _sprite_format)
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
                "dest": CONST.SUFFIX_2X,
                "src" : _.filter(slices, function (e) {
                    return !!~e.indexOf(CONST.SUFFIX_2X)
                })
            },
            {
                "dest": CONST.SUFFIX_3X,
                "src" : _.filter(slices, function (e) {
                    return !!~e.indexOf(CONST.SUFFIX_3X)
                })
            }
        ]
        arr = _.filter(arr, function (e) {
            return !_.isEmpty(e.src)
        })
        return arr
    }

    function formatSpriteSmithCfg(_dest,_src, _format) {
        var exportImageFormat = _format || 'png';
        return {
            "engine": options.engine || "pixelsmith",
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

    return configItems
}