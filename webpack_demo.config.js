const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    index: path.join(__dirname, 'demo/src/index.js')
  },

  // output: {
  //   library: 'symphony',
  //   // Add /* filename */ comments to generated require()s in the output.
  //   pathinfo: true,
  //   // This does not produce a real file. It's just the virtual path that is
  //   // served by WebpackDevServer in development. This is the JS bundle
  //   // containing code from all our entry points, and the Webpack runtime.
  //   filename: 'static/js/symphony.js',
  //   // There are also additional JS chunk files if you use code splitting.
  //   chunkFilename: 'static/js/symphony.[name].chunk.js',
  //   // // This is the URL that app is served from. We use "/" in development.
  //   // publicPath: publicPath,
  //   // Point sourcemap entries to original disk location (format as URL on Windows)
  //   devtoolModuleFilenameTemplate: info =>
  //     path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
  // },

  output: {
    path: path.join(__dirname, 'public/build'),
    filename: '[name].bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(glsl|frag|vert)$/,
        use: [
          require.resolve('raw-loader'),
          require.resolve('glslify-loader')
        ]
      },
      {
        test: /\.md$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'html-loader'
          },
          {
            loader: 'markdown-loader'
          }
        ]
      },
      // "url" loader works like "file" loader except that it embeds assets
      // smaller than specified limit in bytes as data URLs to avoid requests.
      // A missing `test` is equivalent to a match.
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000
        }
      },
      {
        test: /\.s?css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  devtool: 'inline-source-map',
  mode: 'development'
}
