var path = require('path'),
    fs = require('fs'),
    log = console.log;

var multiSprite = require('./../index')


/*
 * cd multi-sprite/test/ ,then exec 'node testMultiSprite'
 */
var ops = {
    srcCss: 'test/web/src/css',
    // List of images to add to sprite (each sub-folder generate 1 image)
    srcImg: 'test/web/src/slice',
    // Target css file folder, can be the same as source
    destCss: 'test/web/dest/css',
    // Address of target image's folder, target image's name = source folder's name
    destImg: 'test/web/dest/img/sprite',
    // OPTIONAL: Image placing algorithm: top-down, left-right, diagonal, alt-diagonal, binary-tree
    'algorithm': 'binary-tree',
    // OPTIONAL: Padding between imagesm
    'padding': 4,
    // OPTIONAL: Rendering engine: auto, canvas, gm
    'engine': 'gm',
    // OPTIONAL: Preferences for resulting image
    'exportOpts': {
        // Image format (by default will use png)
        'format': 'png',
        // Quality of image (gm only)
        'quality': 90
    },
    successCB: function () {
        log('all done!')
    }
}
multiSprite(ops)



//var spritesmith = require('spritesmith');
//config = {
//    "engine": "gm",
//    "algorithm": "binary-tree",
//    "padding": 4,
//    "dest": "test/web/dest/img/sprite/s4game.png",
//    "exportOpts": {
//        "format": "png",
//        "quality": 90
//    },
//    padding: 4,
//    src:[
//        "test/web/src/slice/s4game/icon-play-disable.png",
//        "test/web/src/slice/s4game/icon-play-live.png"
//    ]
//}
//spritesmith(config,function(err, result){
//    if (err) { console.error(err); process.abort(); return callback(err); }
//    fs.writeFile(config.dest, result.image, { encoding: 'binary' })
//})


//var imageReplaces = {
//    "/users/adi/duowan/github/multi-sprite/test/web/src/slice/s4game/icon-play-disable@2x.png":{
//        height: 32,
//        width: 44,
//        sprite: "/Users/adi/duowan/github/multi-sprite/test/web/dest/img/sprite/s4game@2x.png",
//        spriteWidth: 128,
//        x: 0,
//        y: 0
//    }
//}







