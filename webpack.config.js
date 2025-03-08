const path = require('path');

module.exports = {
  entry: {
    manage: './public/clients/manage/App.jsx',
    myP: './public/clients/myP/App.jsx'
  },
  output: {
    path: path.resolve(__dirname, 'public/dist'),
    filename: '[name]/bundle.js',
    chunkFilename: '[name]/[id].chunk.js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        manage: {
          test: /[\\/]clients[\\/]manage[\\/]/,
          name: 'manage',
          chunks: 'all',
        },
        myP: {
          test: /[\\/]clients[\\/]myP[\\/]/,
          name: 'myP',
          chunks: 'all',
        }
      }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  mode: 'development',
};