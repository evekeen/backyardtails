const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
  mode: "development",

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js"]
  },

  entry: {
    'server': ['./src/server.ts',]
  },

  output: {
    path: path.resolve(__dirname, '../docker/backend'),
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
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin()
  ],

  target: 'node',

  node: {
    fs: 'empty',
    net: 'empty'
  }
};