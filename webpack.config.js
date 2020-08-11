const glob = require('glob');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: glob.sync('./src/js/*.js'),
  output: {
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  watch: true,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },

      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
        ],
      },

      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },

      {
        test: /\.(svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images',
            },
          },
        ],
      },
    ],
  },
};