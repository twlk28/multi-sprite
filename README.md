# multi-sprite

> Create sprites and updates css.

## Getting Started

```install
npm install multi-sprite --save-dev
```

```use
require('multi-sprite')(config)
```

### the config object

    {
        // Source css folder
        srcCss: 'src/css',
        // List of images to add to sprite (each sub-folder generate 1 image)
        srcImg: 'src/slice',
        // Target css file folder, can be the same as source
        destCss: 'dest/css',
        // Address of target image's folder, target image's name = source folder's name
        destImg: 'dest/img/sprite',
        // OPTIONAL: Image placing algorithm: top-down, left-right, diagonal, alt-diagonal, binary-tree
        'algorithm': 'binary-tree',
        // OPTIONAL: Padding between imagesm
        'padding': 1,
        // OPTIONAL: Rendering engine: auto, canvas, gm
        'engine': 'gm',
        // OPTIONAL: Preferences for resulting image
        'exportOpts': {
          // Image format (by default will use png)
          'format': 'png',
          // Quality of image (gm only)
          'quality': 90
        }
    }

### Attention
For css replace to work you need to follow this rules:

1. "background-image" must be set as separate rule and not as part of "background".
2. Script will add "background-position" rule right after but will not remove any existing one. So either not use one in original file, or use it before "background-image".
3. If you need to add "background-repeat" of image dimensions, do in manually in the original file.


## Release History
_(Nothing yet)_
