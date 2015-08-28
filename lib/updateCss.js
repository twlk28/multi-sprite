var fs = require('fs'),
    path = require('path'),
    cssParser = require('css'),
    cleanCss = require('clean-css'),
    _ = require('lodash')

var CONST = require('./CONST')

var guessNeedProcessREM = (function(){
    var isNeed = false
    return function(cssText){
        if(!isNeed){
            var rs = cssText.match(/([#\.\w\d\s-_\:\,]*)\{[^}]*url\(['"]?..[\/\w]*\/slice[^{]*\}/i)
            if (rs) {
                isNeed = rs[0].match(/width:\s*\d*\.?\d*rem/i)?true:false
            }
        }
        return isNeed
    }
})()

module.exports = function (cssConf, imageReplaces) {

    // 1) 搜索 code，判别当前是否需处理 rem
    // 2) code --> ast
    // 3) 遍历rule节点
    // ... 若需处理 rem
    // ... ... processNodeRuleWithREM(nodeRule, rootFontSize)
    // ... ... ... 若命中，更新 rule节点的 declarations
    // ... 否则
    // ... ... processNodeRule(nodeRule)
    // ... ... ... a) 更新节点 declaration
    // ... ... ... b) 记录到 coll2x coll3x
    // 4) 更新 ast，用 coll2x coll3x
    // 5) ast --> code

    var coll2x = [], coll3x = []
    var rootFontSize = imageReplaces.rootFontSize
    var cssCode = fs.readFileSync(cssConf.src, 'utf8')
    var isNeedREM = guessNeedProcessREM(cssCode)
    var ast = cssParser.parse(cssCode)
    _.each(ast.stylesheet.rules, function(nodeRule){
        if (nodeRule.type !== 'rule') {return}
        if(isNeedREM){
            processNodeRuleWithREM(nodeRule, imageReplaces, rootFontSize)
        }else{
            processNodeRule(nodeRule, imageReplaces, coll2x, coll3x)
        }
    })
    var nodeMedias = generateAllNodeMedia(coll2x, coll3x)
    if(nodeMedias.length > 0){
        ast.stylesheet.rules = ast.stylesheet.rules.concat(nodeMedias)
    }
    var resultCode = cssParser.stringify(ast)
    new cleanCss({compatibility:"ie7", keepSpecialComments:true}).minify(resultCode, function(err, minified){
        fs.writeFile(cssConf.dest, minified.styles)
    })
}
// partical

function processNodeRuleWithREM(nodeRule, imageReplaces, rootFontSize){
    var img, imgKey, __url
    _.each(nodeRule.declarations, function(e){
        if(e.property == 'background-image'){
            __url = __getURL(e.value)
            img = img || imageReplaces[__url]
            imgKey = img? __url: imgKey
        }
    })
    if(!img) return
    // 修改节点
    updateNodeByMerge(nodeRule, __generatorCSSObj(img))

    function __getURL(bgURL){
        return _.trim(bgURL.split('url').join(''), '()"\'')
    }
    function __generatorCSSObj(img){
        return {
            "background-image": "url("+img.sprite+")",
            "background-position":  "-"+img.x/rootFontSize+"rem -"+img.y/rootFontSize+"rem",
            "-webkit-background-size": img.spriteWidth / rootFontSize + "rem",
            "-moz-background-size": img.spriteWidth / rootFontSize + "rem",
            "-o-background-size": img.spriteWidth / rootFontSize + "rem",
            "background-size": img.spriteWidth / rootFontSize + "rem"
        }
    }
}

// 如果规则有 background-image 且其值命中 imageReplaces，更新父节点，追加定位数据
function processNodeRule (nodeRule, imageReplaces, coll2x, coll3x) {
    var img, imgKey, __url
    _.each(nodeRule.declarations, function(e){
        if(e.property == 'background-image'){
            __url = __getURL(e.value)
            img = img || imageReplaces[__url]
            imgKey = img? __url: imgKey
        }
    })
    if(!img) return
    // 修改节点
    updateNodeByMerge(nodeRule, __generatorCSSObj(img))
    // 更新2x 3x 收集器
    updateCollectMX(imgKey, imageReplaces, nodeRule.selectors, coll2x, coll3x)

    function __getURL(bgURL){
        return _.trim(bgURL.split('url').join(''), '()"\'')
    }
    function __generatorCSSObj(img){
        return {
            "background-image": "url("+img.sprite+")",
            "background-position":  "-"+img.x+"px -"+img.y+"px"
        }
    }
}

function updateCollectMX(imgKey, imageReplaces, selectors, coll2x, coll3x){
    var img
    img = imageReplaces[addSuffix(imgKey, CONST.SUFFIX_2X)]
    if(img){
        coll2x.push({
            "selectors": selectors,
            "declarations": {
                "background-image": "url("+img.sprite+")",
                "background-position":  "-"+img.x/2+"px -"+img.y/2+"px",
                "background-size": img.spriteWidth/2 +"px"
            }
        })
    }
    img = imageReplaces[addSuffix(imgKey, CONST.SUFFIX_3X)]
    if(img){
        coll3x.push({
            "selectors": selectors,
            "declarations": {
                "background-image": "url("+img.sprite+")",
                "background-position":  "-"+img.x/3+"px -"+img.y/3+"px",
                "background-size": img.spriteWidth/3 +"px"
            }
        })
    }
    function addSuffix(url, suffix){
        if(!!~(url.indexOf(suffix))){return url}
        var dir = path.dirname(url)
        var newname = path.basename(url, path.extname(url))+suffix+path.extname(url)
        return path.join(dir, newname)
    }
}

function generateAllNodeMedia(coll2x, coll3x){
    var nodeMedias = []
    var mediaDescription2X = 'only screen and (-webkit-min-device-pixel-ratio: 1.5),only screen and (min--moz-device-pixel-ratio: 1.5),(min-resolution: 1.5dppx),only screen and (min-resolution: 240dpi)'
    var mediaDescription3X = 'only screen and (min-device-width : 414px) and (max-device-width : 736px) and (-webkit-min-device-pixel-ratio : 3)'
    if (coll2x.length>0) {
        nodeMedias.push(generatorNodeMedia(coll2x, mediaDescription2X))
    }
    if (coll3x.length>0) {
        nodeMedias.push(generatorNodeMedia(coll3x, mediaDescription3X))
    }
    return nodeMedias
}

function generatorNodeMedia(collection, mediaDescription) {
    return {
        "type": "media",
        "media": mediaDescription,
        "rules"	: collection.map(function (e) {
            return {
                "type": "rule",
                "selectors": e.selectors,
                "declarations": cssObj2nodeDeclarations(e.declarations)
            }
        })
    }
}

// utils
function cssObj2nodeDeclarations(cssObj) {
    return _.map(cssObj, function (v,k) {
        return {
            "type": "declaration",
            "property": k,
            "value": v
        }
    })
}

function updateNodeByMerge(nodeRule, cssObj){
    _.each(nodeRule.declarations, function(e){
        if(_.has(cssObj, e.property)){
            e.value = cssObj[e.property]
            delete cssObj[e.property]
        }
    })
    var nodeDeclarations = cssObj2nodeDeclarations(cssObj)
    nodeRule.declarations = nodeRule.declarations.concat(nodeDeclarations)
}

