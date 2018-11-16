const path = require('path');

module.exports = {
 entry: {
   Arrow: './src/scripts/Arrow.js', 
   YmapsCircleVertex: './src/scripts/YmapsCircleVertex.js',
   YmapsTriangleVertex: './src/scripts/YmapsTriangleVertex.js', 
   Path: './src/scripts/Path.js', 
   Chute: './src/scripts/Chute.js',
   Wind: './src/scripts/Wind.js',
   Flight: './src/scripts/Flight.js', 
   index: './src/scripts/index.js'
 },
  output: {
   filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist/scripts')
  }
};