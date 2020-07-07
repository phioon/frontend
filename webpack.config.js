import path from 'path';

module.exports = {
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    filename: 'main.js',
    path: path.join(__dirname, './django_frontend/app/static/app'),
    publicPath: '/static/app'
  },
  mode: process.env.NODE_ENV || 'development',
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx']
  },
  devServer: {
    contentBase: path.join(__dirname, 'src')
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(css|scss)$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        use: 'file-loader?name=/assets/fonts/[name].[ext]'
      },
      {
        test: /\\..(\.png)/,
        use: 'file-loader?name=/assets/img/flags/[name].[ext]'
      },
      {
        test: /\.(gif|svg|jpg|jpeg|png)$/,
        use: 'file-loader?name=/assets/img/[name].[ext]',
      }
    ]
  }
};
