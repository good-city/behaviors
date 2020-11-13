const path = require('path');
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = (env, argv) => ({
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        contentBase: path.join(__dirname, 'app')
    },
    mode: NODE_ENV,
    entry: {
        index: './src/index'
    },
    output: {
        filename: './js/app.js',
        path: path.resolve(__dirname, 'app')
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
});