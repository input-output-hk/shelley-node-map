const path = require('path')

module.exports = {
  entry: {
    index: path.join(__dirname, './src/index.js')
  },
  output: {
    path: path.join(__dirname, './build'),
    filename: 'index.js',
    library: 'Main',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        loader: require.resolve('babel-loader'),
        options: {
          compact: false
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
        test: /\.(glb)$/,
        use: [
          require.resolve('url-loader')
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
        loader: require.resolve('url-loader')
      },
      {
        test: /\.css$/i,
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
  resolve: {
    extensions: ['.js']
  },
  mode: 'production'
}
