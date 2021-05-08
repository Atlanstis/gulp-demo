# Gulp 自动化构建案例

## 基础依赖

```shell
$ yarn add gulp --dev
```

## 样式编译

首先将 scss 文件，以当前的路径生成到 dist 目录下。

```js
const { src, dest } = require('gulp')

const style = () => {
  // { base: 'src' } 设置基准路径，此时写入流，会按照 src() 中匹配之后的路径（此处路径为 /assets/styles/），生成文件
  return src('src/assets/styles/*.scss', { base: 'src' }).pipe(dest('dist'))
}

module.exports = {
  style
}
```

执行命令 `yarn gulp style` ，可看到对应的文件生成。

### gulp-sass

将 scss 文件转换成 css 文件。

#### 安装

```shell
$ yarn add gulp-sass --dev
```

#### 修改 gulpfile.js

在文件流中间进行 sass 模板的处理。

```js
const { src, dest } = require('gulp')
const sass = require('gulp-sass')

const style = () => {
  // { base: 'src' } 设置基准路径，此时写入流，会按照 src() 中匹配之后的路径（此处路径为 /assets/styles/），生成文件
  return src('src/assets/styles/*.scss', { base: 'src' })
    .pipe(sass({ outputStyle: 'expanded' })) // { outputStyle: 'expanded' } css 文件中，将中括号完全展开
    .pipe(dest('dist'))
}

module.exports = {
  style
}
```

sass 模板中，会把以下划线 _ 开头的 scss 文件，会被认为为主文件的依赖文件，不会被转化。

此时，我们就完成了scss 文件的编译。

## 脚本文件编译

### gulp-babel

编译 Javascript 到指定的 ES 版本。

#### 安装

```shell
$ yarn add gulp-babel --dev
$ yarn add @babel/core @babel/preset-env --dev
```

#### 修改 gulpfile.js

```js
const { src, dest } = require('gulp')
const babel = require('gulp-babel')

const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('dist'))
}

module.exports = {
  script
}
```

`@babel/preset-env` 会将所有 ES 的新特性进行编译转化。可以根据需要，更改 babel 配置，达到不同的转化效果。

运行 `yarn gulp script` ，查看结果。

## 页面文件编译

此处 html 文件，采用了模板引擎 swig，重用重复部分。

### gulp-swig

#### 安装

```shell
$ yarn add gulp-swig --dev
```

#### 修改 gulpfile.js

```js
const swig = require('gulp-swig')

const data = {
  pkg: require('./package.json'),
  date: new Date()
}

const page = () => {
  // src/**/*.html 任意子目录下的 html
  return src('src/*.html', { base: 'src' })
    .pipe(swig({ data })) // 处理动态数据
    .pipe(dest('dist'))
}

module.exports = {
  page
}
```

针对 html 模板中的动态数据，可通过传入动态数据的方式，进行变更。

运行 `yarn gulp page` ，查看结果。

## 图片和字体文件转换

### gulp-imagemin

对图片资源进行压缩，非图片资源会被略过处理。

#### 安装

```shell
$ yarn add gulp-imagemin --dev
```

#### 修改 gulpfile.js

```js
const { src, dest } = require('gulp')
const imagemin = require('gulp-imagemin')

const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(imagemin())
    .pipe(dest('dist'))
}
const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(imagemin())
    .pipe(dest('dist'))
}
module.exports = {
  image,
  font
}
```

运行命令 `yarn gulp image`，`yarn gulp font` 查看结果。

## 组合以上任务

由于以上几个任务，运行过程中，没有相互的关联。因此，我们可以通过 `parallel()` 并行执行多个任务，提升构建效率。

### 修改 gulpfile.js

```js
const { src, dest, parallel } = require('gulp')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const swig = require('gulp-swig')
const imagemin = require('gulp-imagemin')

const data = {
  pkg: require('./package.json'),
  date: new Date()
}

const style = () => {
  // { base: 'src' } 设置基准路径，此时写入流，会按照 src() 中匹配之后的路径（此处路径为 /assets/styles/），生成文件
  return src('src/assets/styles/*.scss', { base: 'src' })
    .pipe(sass({ outputStyle: 'expanded' })) // { outputStyle: 'expanded' } css 文件中，将中括号完全展开
    .pipe(dest('dist'))
}

const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('dist'))
}

const page = () => {
  // src/**/*.html 任意子目录下的 html
  return src('src/*.html', { base: 'src' })
    .pipe(swig({ data })) // 处理动态数据
    .pipe(dest('dist'))
}

const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(imagemin())
    .pipe(dest('dist'))
}

const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(imagemin())
    .pipe(dest('dist'))
}

const compile = parallel(style, script, page, image, font)

module.exports = {
  compile
}
```

运行命令 `yarn gulp compile `，查看结果。

## 非编译文件

针对非编译的文件，对其进行直接复制。

```js
const { src, dest, parallel } = require('gulp')

const extra = () => {
  return src('public/**', { base: 'public' }).pipe(dest('dist'))
}

module.exports = {
  extra
}
```

运行命令 `yarn gulp extra `，查看结果。

## 自动清理

针对每次构建前，我们将对 dist 目录进行清理，防止文件冗余。

### del

#### 安装

```shell
$ yarn add del --dev
```

#### 修改 gulpfile.js

```js
const del = require('del')

const clean = () => {
  // 参数为需要清除的文件路径
  return del(['dist'])
}

module.exports = {
   clean
}
```

`del` 返回一个promise，因此我们可以直接返回，满足 gulp 异步任务的要求。

运行命令 `yarn gulp clean `，查看结果。

### 调整任务执行顺序

`del` 的执行，应该在其它编译任务前，因此我们可以通过 gulp 的 `series` 方法，创建串型任务。

```js
const { src, dest, parallel, series } = require('gulp')

const del = require('del')

const sass = require('gulp-sass')
const babel = require('gulp-babel')
const swig = require('gulp-swig')
const imagemin = require('gulp-imagemin')

const data = {
  pkg: require('./package.json'),
  date: new Date()
}

const clean = () => {
  // 参数为需要清除的文件路径
  return del(['dist'])
}

const style = () => {
  // { base: 'src' } 设置基准路径，此时写入流，会按照 src() 中匹配之后的路径（此处路径为 /assets/styles/），生成文件
  return src('src/assets/styles/*.scss', { base: 'src' })
    .pipe(sass({ outputStyle: 'expanded' })) // { outputStyle: 'expanded' } css 文件中，将中括号完全展开
    .pipe(dest('dist'))
}

const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('dist'))
}

const page = () => {
  // src/**/*.html 任意子目录下的 html
  return src('src/*.html', { base: 'src' })
    .pipe(swig({ data })) // 处理动态数据
    .pipe(dest('dist'))
}

const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(imagemin())
    .pipe(dest('dist'))
}

const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(imagemin())
    .pipe(dest('dist'))
}

const extra = () => {
  return src('public/**', { base: 'public' }).pipe(dest('dist'))
}

const compile = parallel(style, script, page, image, font)

const build = series(clean, parallel(compile, extra))

module.exports = {
  build
}
```

这样，在执行命令 `yarn gulp build` 后，gulp 会先去清理 dist 目录，之后再开启构建任务。

## 自动加载插件

随着编译任务的增多，依赖的插件也会越来越多，因此我们可以通过 `gulp-load-plugins` 来对插件进行管理。

### gulp-load-plugins

#### 安装

```shell
$ yarn add gulp-load-plugins --dev
```

#### 修改 gulpfile.js

`loadPlugins()`  会返回一个对象，将所有的插件，以插件名 `gulp-` 后的名称，作为对象的键值。因此我们可以通过获取对象属性的方式，拿到对应的插件。(多 - 插件，会以驼峰方式作为键值)

```js
const { src, dest, parallel, series } = require('gulp')

const del = require('del')

const loadPlugins = require('gulp-load-plugins')

const plugins = loadPlugins()

const data = {
  pkg: require('./package.json'),
  date: new Date()
}

const clean = () => {
  // 参数为需要清除的文件路径
  return del(['dist'])
}

const style = () => {
  // { base: 'src' } 设置基准路径，此时写入流，会按照 src() 中匹配之后的路径（此处路径为 /assets/styles/），生成文件
  return src('src/assets/styles/*.scss', { base: 'src' })
    .pipe(plugins.sass({ outputStyle: 'expanded' })) // { outputStyle: 'expanded' } css 文件中，将中括号完全展开
    .pipe(dest('dist'))
}

const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
    .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('dist'))
}

const page = () => {
  // src/**/*.html 任意子目录下的 html
  return src('src/*.html', { base: 'src' })
    .pipe(plugins.swig({ data })) // 处理动态数据
    .pipe(dest('dist'))
}

const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const extra = () => {
  return src('public/**', { base: 'public' }).pipe(dest('dist'))
}

const compile = parallel(style, script, page, image, font)

const build = series(clean, parallel(compile, extra))

module.exports = {
  build
}
```

## 热更新开发服务器

### browser-sync

支持代码文件修改后，热更新到浏览器页面。

#### 安装

```shell
$ yarn add browser-sync --dev
```

#### 修改 gulpfile.js

```js
const browserSync = require('browser-sync')

// 创建一个开发服务器
const bs = browserSync.create()

// 创建 gulp 任务
const serve = () => {
  bs.init({
    notify: false,
    port: 2080, // 启动端口
    open: true, // 是否自动打开浏览器
    files: 'dist/**', // 监听的文件，发生变化后，自动更新浏览器
    server: {
      baseDir: 'dist', // web 服务根目录
      routes: {
        '/node_modules': 'node_modules' // 针对 / 开头请求，进行转接
      }
    }
  })
}

module.exports = {
  serve
}
```

执行命令 `yarn gulp serve`，会自动打开一个以 dist 目录为基础的网页。

## 监视变化以及构建过程优化

gulp 提供了 `watch` 方法，该方法会监听路径通配符下的文件，然后重新去执行某个任务。

### 修改 gulpfile.js

给先对应的编译任务，添加 watch 方法。这时，源文件发生变化后，就会触发任务的重新执行，进而影响 dist 目录及浏览器页面显示。

```js
const { watch } = require('gulp')

const page = () => {
  // src/**/*.html 任意子目录下的 html
  return src('src/*.html', { base: 'src' })
    .pipe(plugins.swig({ data, defaults: { cache: false } })) // 防止模板缓存导致页面不能及时更新
    .pipe(dest('dist'))
}

const serve = () => {
  // 第一个参数为路径，第二个参数为执行的任务
  watch('src/assets/styles/*.scss', style)
  watch('src/assets/scripts/*.js', script)
  watch('src/*.html', page)
  watch('src/assets/images/**', image)
  watch('src/assets/fonts/**', font)
  watch('public/**', extra)

  bs.init({
    notify: false,
    port: 2080, // 启动端口
    open: true, // 是否自动打开浏览器
    files: 'dist/**', // 监听的文件，发生变化后，自动更新浏览器
    server: {
      baseDir: 'dist', // web 服务根目录
      routes: {
        '/node_modules': 'node_modules' // 针对 / 开头请求，进行转接
      }
    }
  })
}
```

> 这里可能会因为 swig 模板引擎缓存的机制导致页面不会发生变化。此时，需要额外将 swig 选项中 cache 设置为 false。

### 优化开发流程

针对开发阶段，那些搬运压缩的任务（图片，字体等），更好的方案是不进行重新构建，直接进行复制，减少开发过程中的损耗。

在这里，我们将图片字体的资源，在开发过程中，不进行构建。仅在打包中，进行构建压缩。

通过 `browser-sync` 的 baseDir 属性，依次获取没有构建的资源。

```js
const serve = () => {
  // 第一个参数为路径，第二个参数为执行的任务
  watch('src/assets/styles/*.scss', style)
  watch('src/assets/scripts/*.js', script)
  watch('src/*.html', page)
	// 图片字体资源等，发生变化，重新加载即可
  watch(['src/assets/images/**', 'src/assets/fonts/**', 'public/**'], bs.reload)
  
  bs.init({
    notify: false,
    port: 2080, // 启动端口
    open: true, // 是否自动打开浏览器
    files: 'dist/**', // 监听的文件，发生变化后，自动更新浏览器
    server: {
      baseDir: ['dist', 'src', 'public'], // 当为数组时，会按照顺序依次查找文件
      routes: {
        '/node_modules': 'node_modules' // 针对 / 开头请求，进行转接
      }
    }
  })
}

const compile = parallel(style, script, page)

const build = series(clean, parallel(compile, image, font, extra))

// 先进行编译，再打开浏览器，防止浏览器资源不存在
const develop = series(compile, serve)

module.exports = {
  build,
  develop
}
```

至此，我们可以通过 `yarn gulp develop` 命令，进行开发。

## useref 文件引用处理

针对项目中，直接引用 node_modules 的内容，在打包后还是无法使用的。因此，我们可以通过 `gulp-useref` 插件进行处理。

### gulp-useref

#### 安装

```shell
$ yarn add gulp-useref --dev
```

#### 修改 gulpfile.js

```js
const useref = () => {
  return (
    src('dist/*.html', { base: 'dist' })
      // searchPath: 查找路径
      .pipe(plugins.useref({ searchPath: ['dist', '.'] }))
      .pipe(dest('dist'))
  )
}

module.exports = {
  useref
}
```

`gulp-useref` 的主要作用是将 html 文件中，以下格式（以`<!-- build:` 开头，`<!-- endbuild -->` 结束）的段落进行处理。查找相对应的文件，并打包生成新的文件。此处，将 /node_modules/ 和 assets 下的内容，打包至 assets/styles/vendor.css 与  assets/styles/main.css 下。

```html
<!-- build:css assets/styles/vendor.css -->
<link rel="stylesheet" href="/node_modules/bootstrap/dist/css/bootstrap.css">
<!-- endbuild -->
<!-- build:css assets/styles/main.css -->
<link rel="stylesheet" href="assets/styles/main.css">
<!-- endbuild -->
```

执行命令 `yarn gulp useref `，会将 dist 目录下 html 文件进行处理。

### 文件压缩

通过执行命令 `yarn gulp useref ` 后，我们还可以将相对应转化成的文件进行压缩，减少体积。

#### 安装

```shell
// 压缩 html
$ yarn add gulp-htmlmin --dev
// 压缩 js
$ yarn add gulp-uglify --dev
// 压缩 css
$ yarn add gulp-clean-css --dev
// 判断文件后缀
$ yarn add gulp-if --dev
```

####  修改  gulpfile.js

```js
const useref = () => {
  return (
    src('dist/*.html', { base: 'dist' })
      // searchPath: 查找路径
      .pipe(plugins.useref({ searchPath: ['dist', '.'] }))
      // 压缩 js css html
      .pipe(plugins.if(/\.js$/, plugins.uglify()))
      .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
      .pipe(
        plugins.if(
          /\.html$/,
          plugins.htmlmin({
            collapseWhitespace: true, // 去除空格
            minifyCSS: true, // 压缩 html 文件内 css
            minifyJS: true // 压缩 html 文件内 js
          })
        )
      )
      .pipe(dest('dist'))
  )
}
```

执行命令 `yarn gulp useref ` ，查看结果。

### 更改构建过程

 在上一步 useref 过程中，存在一个问题。即在 dist 文件下，存在读取跟写入同时存在的问题，可能会导致一些问题。因此，我们将构建文件先打包至 temp 目录后，再将 temp 目录下内容，打包到 dist 目录下。

### 最后的 gulpfile.js

```js
const { src, dest, parallel, series, watch } = require('gulp')

const del = require('del')

// 热更新服务器
const browserSync = require('browser-sync')

// 自动加载插件
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()

// 创建一个开发服务器
const bs = browserSync.create()

const data = {
  menus: [
    {
      name: 'Home',
      icon: 'aperture',
      link: 'index.html'
    },
    {
      name: 'Features',
      link: 'features.html'
    },
    {
      name: 'About',
      link: 'about.html'
    }
  ],
  pkg: require('./package.json'),
  date: new Date()
}

const clean = () => {
  // 参数为需要清除的文件路径
  return del(['dist', 'temp'])
}

const style = () => {
  // { base: 'src' } 设置基准路径，此时写入流，会按照 src() 中匹配之后的路径（此处路径为 /assets/styles/），生成文件
  return src('src/assets/styles/*.scss', { base: 'src' })
    .pipe(plugins.sass({ outputStyle: 'expanded' })) // { outputStyle: 'expanded' } css 文件中，将中括号完全展开
    .pipe(dest('temp'))
    .pipe(bs.reload({ stream: true }))
}

const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
    .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('temp'))
    .pipe(bs.reload({ stream: true }))
}

const page = () => {
  // src/**/*.html 任意子目录下的 html
  return src('src/*.html', { base: 'src' })
    .pipe(plugins.swig({ data, defaults: { cache: false } })) // 防止模板缓存导致页面不能及时更新
    .pipe(dest('temp'))
    .pipe(bs.reload({ stream: true }))
}

const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const extra = () => {
  return src('public/**', { base: 'public' }).pipe(dest('dist'))
}

const serve = () => {
  // 第一个参数为路径，第二个参数为执行的任务
  watch('src/assets/styles/*.scss', style)
  watch('src/assets/scripts/*.js', script)
  watch('src/*.html', page)
  // 图片字体资源等，发生变化，重新加载即可
  watch(['src/assets/images/**', 'src/assets/fonts/**', 'public/**'], bs.reload)

  bs.init({
    notify: false,
    port: 2080, // 启动端口
    open: true, // 是否自动打开浏览器
    // files: 'dist/**', // 监听的文件，发生变化后，自动更新浏览器
    server: {
      baseDir: ['temp', 'src', 'public'], // 当为数组时，会按照顺序依次查找文件
      routes: {
        '/node_modules': 'node_modules' // 针对 / 开头请求，进行转接
      }
    }
  })
}

const useref = () => {
  return (
    src('temp/*.html', { base: 'temp' })
      // searchPath: 查找路径
      .pipe(plugins.useref({ searchPath: ['temp', '.'] }))
      // 压缩 js css html
      .pipe(plugins.if(/\.js$/, plugins.uglify()))
      .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
      .pipe(
        plugins.if(
          /\.html$/,
          plugins.htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
          })
        )
      )
      .pipe(dest('dist'))
  )
}

const compile = parallel(style, script, page)

const build = series(
  clean,
  parallel(series(compile, useref), image, font, extra)
)

// 先进行编译，再打开浏览器，防止浏览器资源不存在
const develop = series(compile, serve)

module.exports = {
  clean,
  build,
  develop
}
```

