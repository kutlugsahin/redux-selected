var path = require('path');

function resolveSrc(pathToFile) {
    return path.resolve(path.join(__dirname, './src', pathToFile || './'));
}

function resovleDist(pathToFile) {
    return path.resolve(path.join(__dirname, './dist', pathToFile || './'));
}

module.exports = {
    entry: resolveSrc('index.ts'),
    output: {
        filename: 'index.js',
        libraryTarget: 'umd',
    },
    externals: {
        redux: {
            commonjs: 'redux',
            commonjs2: 'redux',
            amd: 'redux',
            root: 'Redux'
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'babel-loader',
                include: [resolveSrc()],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
};
