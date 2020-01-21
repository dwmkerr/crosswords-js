const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.js',

    devServer: {
      contentBase: path.join(__dirname, 'sample'),
      compress: true,
    },


    module: {
      rules: [
        {
          test: /\.less$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'less-loader'
          ],
        },
      ]
    },

    // Add an instance of the MiniCssExtractPlugin to the plugins list
    // But remember - only for production!
    plugins: isProduction ? [new MiniCssExtractPlugin({ filename: 'crosswords.css' })] : [],

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'crosswords.js',
    }
  };
};
