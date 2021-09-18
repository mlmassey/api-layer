/* eslint-disable @typescript-eslint/no-var-requires */
//
// This sample webpack config shows a very simple web application using webpack
// This assumes you want mocking when running in development, but want mocking
// turned off in production.  This is set using the NODE_ENV environment variable
// which is quite common
//
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const isDev = mode === 'development';

const templateContent = `
<html>
  <body>
    <h1>api-layer Sample Webapp</h1>
    <h2>Mode: ${isDev ? 'development' : 'production'}</h2>
    <span>Open your console to check output</span>
  </body>
</html>
`;

module.exports = {
  mode,
  devtool: isDev ? 'cheap-module-source-map' : undefined,
  entry: './src/index.ts',
  target: 'web',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
  },
  plugins: [new HtmlWebpackPlugin({ templateContent })].filter(Boolean),
  devServer: {
    publicPath: '/',
    contentBase: path.resolve(__dirname, './public'),
    open: true,
  },
};
