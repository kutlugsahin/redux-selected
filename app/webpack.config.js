var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
function resolveSrc(pathToFile) {
    return path.resolve(path.join(__dirname, pathToFile || './'));
}

function resovleDist(pathToFile) {
    return path.resolve(path.join(__dirname, 'dist', pathToFile || './'));
}

const fromNodeModules = (packageName) => path.resolve(path.join('../node_modules', packageName));
const reduxSelectedPath = path.resolve(path.join('../redux-selected'));
console.log(fromNodeModules('redux-selected'));

module.exports = {
    entry: resolveSrc('index.tsx'),
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'index.js',
    },
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(__dirname, './dist')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'babel-loader',
                include: [resolveSrc(), reduxSelectedPath],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            'redux-selected': path.join(reduxSelectedPath, 'src', 'index.ts'),
        },
    },
    plugins: [new HtmlWebpackPlugin({
        template: './public/index.html',        
    })],
};
