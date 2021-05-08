const { src, dest, parallel, series } = require('gulp')

const del = require('del')

// 热更新服务器
const browserSync = require('browser-sync')

// 自动加载插件
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()

// 创建一个开发服务器
const bs = browserSync.create()

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

const compile = parallel(style, script, page, image, font)

const build = series(clean, parallel(compile, extra))

module.exports = {
  build,
  serve
}
