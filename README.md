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