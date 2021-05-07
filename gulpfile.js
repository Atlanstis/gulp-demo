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
