const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/index.ts',
  target: 'node',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true, // Cleans the output directory before emit
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      // In production (single-process) mode, use the single-process db client.
      // In other modes (like when ts-node runs cluster.ts), it will resolve to the default dbClient.ts
      '../database/dbClient': isProd
        ? path.resolve(__dirname, 'src/database/dbClient.single.ts')
        : path.resolve(__dirname, 'src/database/dbClient.ts'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
