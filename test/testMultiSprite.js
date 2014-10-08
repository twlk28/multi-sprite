var path = require('path'),
    fs = require('fs'),
    log = console.log;

var multiSprite = require('./../index')


/*
 * cd multi-sprite/test/ ,then exec 'node testMultiSprite'
 */
var ops = {
    srcCss: 'web/src/css',
    // List of images to add to sprite (each sub-folder generate 1 image)
    srcImg: 'web/src/slice',
    // Target css file folder, can be the same as source
    destCss: 'web/dest/css',
    // Address of target image's folder, target image's name = source folder's name
    destImg: 'web/dest/img/sprite',
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
