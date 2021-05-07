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