const { src, dest } = require('gulp')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const swig = require('gulp-swig')

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

module.exports = {
  style,
  script,
  page
}
