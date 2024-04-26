const { DefinePlugin, container } = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseConfig = {
  mode: process.env.NODE_ENV || 'development',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
};

const serverConfig = {
  devtool: 'eval-source-map',
  name: 'server',
  target: 'node',
  externalsPresets: {
    node: true,
  },
  ignoreWarnings: [
    {
      /*
       * Express compilation issue:
       * WARNING in ../node_modules/express/lib/view.js 81:13-25 Critical dependency: the request of a dependency is an expression
       * more at: https://github.com/webpack/webpack/issues/1576
       */
      module: /express/,
      message:
        /Critical\sdependency:\sthe\srequest\sof\sa\sdependency\sis\san\sexpression/,
    },
  ],
  entry: {
    server: path.resolve(__dirname, './src/server/index.ts'),
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      { test: /\.(js|tsx?)$/, loader: 'ts-loader', exclude: /node_modules/ },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['!public/**'],
    }),
    new DefinePlugin({
      __Server__: JSON.stringify(true),
    }),
  ],
};

const moduleFederationPlugin = new container.ModuleFederationPlugin({
  filename: 'pdfClient.[contenthash].js',
  library: {
    type: 'global',
    name: 'pdfClient',
  },
  shared: {
    react: {
      requiredVersion: '*',
      singleton: true,
    },
    'react-dom': {
      requiredVersion: '*',
      singleton: true,
    },
    'react-router-dom': {
      requiredVersion: '*',
      singleton: true,
    },
    '@scalprum/core': {
      requiredVersion: '*',
      singleton: true,
    },
    '@scalprum/react-core': {
      requiredVersion: '*',
      singleton: true,
    },
  }
})

const clientConfig = {
  name: 'client',
  target: 'web',
  entry: {
    client: path.resolve(__dirname, './src/client/client.ts'),
  },
  output: {
    path: path.resolve(__dirname, './dist/public'),
    filename: '[name].js',
  },
  plugins: [
    moduleFederationPlugin,
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/client/index.html'),
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "swc-loader",
          options: {
            "jsc": {
              transform: {
                "react": {
                  "runtime": "automatic"
                }
              },
              parser: {
                "syntax": "typescript",
                "tsx": true
              }
            }
          }
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ]
  }
}

const srConfig = merge(baseConfig, serverConfig);

const clConfig = merge(baseConfig, clientConfig);

module.exports = [srConfig, clConfig];
