const glob = require('glob');
const path = require('path');

module.exports = {
  mode: 'development',   
  entry: glob.sync('./src/scripts/*.js'),   
  output: {
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, 'dist/scripts')
  }, 
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },       
      {
         test: /\.(png|svg|jpg|gif)$/,
         use: [
          'file-loader'
        ]
      }     
    ]
  },  
  watch: true  
};