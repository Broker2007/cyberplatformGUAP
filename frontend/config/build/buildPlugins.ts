import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { BuildOptions } from './types/config';

// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const defaultApiBaseUrl = 'http://api.cyberplatform.com:8080';

export function buildPlugins({ paths, isDev }: BuildOptions): webpack.WebpackPluginInstance[] {
    const apiBaseUrl = process.env.API_BASE_URL || defaultApiBaseUrl;

    return [
        new HtmlWebpackPlugin({
            template: paths.html,
        }),
        new webpack.ProgressPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash:8].css',
            chunkFilename: 'css/[name].[contenthash:8].css',
        }),
        new webpack.DefinePlugin({
            __IS_DEV__: JSON.stringify(isDev),
            __API_BASE_URL__: JSON.stringify(apiBaseUrl),
        }),
        new webpack.HotModuleReplacementPlugin(),
        // new BundleAnalyzerPlugin(),
    ];
}
