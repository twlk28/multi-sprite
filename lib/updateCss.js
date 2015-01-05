var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    gm = require('spritesmith/node_modules/gmsmith/node_modules/gm');

var CONST = require('./CONST')

module.exports = function (css, imageReplaces) {

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

            img = imageReplaces[addSuffix(pathToResource, CONST.SUFFIX_3X)]
            if (img) {
                selectors = selectors || getSelectorsBySlice(data, pathToResource)
                cssSnippet3x += calcRetinaCssSnippet(selectors, img)
            }
            img = imageReplaces[addSuffix(pathToResource, CONST.SUFFIX_2X)]
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

}