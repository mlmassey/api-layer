/* eslint-disable @typescript-eslint/no-var-requires */
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
    isDev &&
      new CopyWebpackPlugin({
        patterns: [{ from: 'src/api/mock', to: 'mock' }],
      }),
  ].filter(Boolean),
  devServer: {
    publicPath: '/',
    contentBase: path.resolve(__dirname, './public'),
    open: true,
  },
};
