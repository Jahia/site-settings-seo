const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const shared = require("./webpack.shared");
const moonstone = require("@jahia/moonstone/dist/rulesconfig-wp");

module.exports = (env, argv) => {
    let config = {
        entry: {
            main: path.resolve(__dirname, 'src/javascript/index')
        },
        output: {
            path: path.resolve(__dirname, 'src/main/resources/javascript/apps/'),
            filename: 'siteSettingsSeo.bundle.js',
            chunkFilename: '[name].siteSettingsSeo.[chunkhash:6].js'
        },
        resolve: {
            mainFields: ['module', 'main'],
            extensions: ['.mjs', '.js', '.jsx', '.json', '.scss'],
            alias: {
                '~': path.resolve(__dirname, './src/javascript'),
            },
            fallback: { "url": false }
        },
        module: {
            rules: [
                ...moonstone,
                {
                    test: /\.m?js$/,
                    type: 'javascript/auto'
                },
                {
                    test: /\.jsx?$/,
                    include: [path.join(__dirname, 'src')],
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    modules: false,
                                    targets: {chrome: '60', edge: '44', firefox: '54', safari: '12'}
                                }],
                                '@babel/preset-react'
                            ],
                            plugins: [
                                'lodash',
                                ['transform-imports', {
                                    '@material-ui/icons': {
                                        transform: '@material-ui/icons/${member}',
                                        preventFullImport: true
                                    }
                                }],
                                '@babel/plugin-syntax-dynamic-import',
                                '@babel/plugin-proposal-export-default-from',
                                '@babel/plugin-proposal-class-properties'
                            ]
                        }
                    }
                },
                {
                    test: /\.scss$/i,
                    sideEffects: true,
                    use: [
                        'style-loader',
                        // Translates CSS into CommonJS
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    mode: 'local'
                                }
                            }
                        },
                        // Compiles Sass to CSS
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    type: 'asset/resource',
                    dependency: { not: ['url'] }
                }
            ]
        },
        plugins: [
            new ModuleFederationPlugin({
                name: "siteSettingsSeo",
                library: { type: "assign", name: "appShell.remotes.siteSettingsSeo" },
                filename: "remoteEntry.js",
                exposes: {
                    './init': './src/javascript/init'
                },
                remotes: {
                    '@jahia/app-shell': 'appShellRemote',
                    '@jahia/content-editor': 'appShell.remotes.contentEditor'
                },
                shared
            }),
            new CleanWebpackPlugin(path.resolve(__dirname, 'src/main/resources/javascript/apps/'), {verbose: false}),
            new CopyWebpackPlugin([{from: './package.json', to: ''}]),
            new CaseSensitivePathsPlugin()
        ],
        mode: 'development'
    };

    config.devtool = (argv.mode === 'production') ? 'source-map' : 'eval-source-map';

    if (argv.analyze) {
        config.devtool = 'source-map';
        config.plugins.push(new BundleAnalyzerPlugin());
    }

    return config;
};
