const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
  mode: "production",

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js"]
  },

  devServer: {
    contentBase: './dist',
    hot: true,
  },

  entry: {
    'main': [
      './src/index.tsx',
      './src/css/main.css',
      './src/css/login.css',
      './node_modules/bootstrap/dist/css/bootstrap.min.css',
      './src/img/guard.png',
      './src/img/priest.png',
      './src/img/baron.png',
      './src/img/handmaid.png',
      './src/img/prince.png',
      './src/img/king.png',
      './src/img/countess.png',
      './src/img/princess.png',
      './src/img/mish.svg',
      './src/img/mish-active.svg',
      './src/img/cover.jpg',
      './src/img/jigsaw.svg',
      './src/img/winner.svg',
    ]
  },

  output: {
    path: path.resolve(__dirname, '../docker/ui'),
  },

  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader"
          }
        ]
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(cur|woff|woff2|eot|ttf|otf)$/,
        loader: 'url-loader',
        options: {
          name: '[path][name].[ext]?[hash]'
        },
        exclude: /node_modules/
      },
      {
        test: /\.(svg|png|gif|jpg)$/,
        loader: 'file-loader',
        options: {
          name: 'img/[name].[ext]'
        },
        exclude: /node_modules/
      },
    ]
  },

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  // externals: {
  //   "react": "React",
  //   "react-dom": "ReactDOM"
  // }

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Love Letter',
      hash: true,
      // Load a custom template (lodash by default)
      template: './src/index.html'
    })
  ]
};