# multi-sprite

> 一个自动合并css图片的模块，支持合并2x、3x、多切片文件夹的情况。


##安装
`npm install multi-sprite`

## 使用
`require('multi-sprite')(configs)`

详见：[测试例子][5]

### configs
* rootFontSize: rem单位值，切换成rem处理方式时需要设置改值，默认 750/16。当css切片宽度使用rem单位时，切换成rem处理方式。
* srcImg: 切片文件夹，比如 `src/slice`
* srcCss:  引用切片的样式文件夹，比如 `src/css`
* destImg: 输出的雪碧图文件夹，比如`dest/img/sprite`
* destCss: 输出的样式文件夹，比如`dest/css`
* algorithm: 雪碧图的排序算法，支持：`top-down, left-right, diagonal, alt-diagonal, binary-tree`。默认值 `binary-tree`
* padding: 切片间隙像素值，默认值`0`
* engine: 图片处理引擎，支持：`auto, canvas, gm`，默认值`gm`
* exportOpts: 导出图片的格式信息
	* format： 支持：`png, jpg`，默认值`png`
	* quality: `gm`引擎的png质量控制，如`90`
* successCB: 图片和样式处理完成后的回调函数
	
### 切片约定
* 配置项 `configs.srcImg` 为切片文件夹，可内建子文件夹，一个子文件夹对应一张雪碧图
* 切片如有 `@2x`, `@3x` 尾缀的图片，将生成对应高清的雪碧图
* 每个`@2x` 切片像素值是偶数；每个`@3x` 切片像素值是3的倍数；

### 样式约定
* 参与合并图片的样式，使用语法 `background-image:url()` 引入切片
* `@2x`, `@3x` 尾缀的图片名字与1倍图保持一致，多倍图切片不需要引入样式表，`multi-sprite` 会自动加上 媒体查询代码片段
* 可参考 [测试的@3x例子][6]


##历史
* 0.2.0 对css的更新操作使用 reworkcss/css，替代正则替换
* 0.1.9 增加rem 处理方式
* 0.1.6 修复win32 下雪碧图样式替换失效问题
* 0.1.4 支持3x图片合并
* 0.0.3 配置参数增加，执行成功后的回调
* 0.0.1 支持2x、多雪碧图合并



[1]: https://github.com/Ensighten/spritesmith
[2]: https://github.com/Ensighten/spritesmith#requirements
[3]: http://www.graphicsmagick.org/download.html
[4]: http://phantomjs.org/download.html
[5]: https://github.com/twlk28/multi-sprite/blob/master/test/testMultiSprite.js
[6]: https://github.com/twlk28/multi-sprite/blob/master/test/web/src/css/test.css
