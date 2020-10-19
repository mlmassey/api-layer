/* eslint-disable @typescript-eslint/no-var-requires */
//
// This sample webpack config shows a very simple web application using webpack
// This assumes you want mocking when running in development, but want mocking
// turned off in production.  This is set using the NODE_ENV environment variable
// which is quite common
//
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
  plugins: [
    new HtmlWebpackPlugin({ templateContent }),
    /*
     * We will use the CopyWebpackPlugin to copy all our mock files to the correct location
     * in the webpack-dev-server so they can be found by the WebMockResolver.  This will attempt
     * to copy all files with *.mock.* to the same folder structure as found under our ./src/api
     * folder.
     */
    isDev &&
      new CopyWebpackPlugin({
        patterns: [{ from: '**/*.mock.*', to: 'mock', context: 'src/api' }],
      }),
  ].filter(Boolean),
  devServer: {
    publicPath: '/',
    contentBase: path.resolve(__dirname, './public'),
    open: true,
  },
};
