import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import { BuildOptions } from './types/config';

export function buildDevServer(options: BuildOptions): DevServerConfiguration {
    return {
        port: options.port,
        open: true,
        historyApiFallback: true,
        hot: true,
        proxy: {
            '/auth': 'http://127.0.0.1:8081',
            '/news': 'http://127.0.0.1:8081',
            '/lab-templates': 'http://127.0.0.1:8081',
            '/uploads': 'http://127.0.0.1:8081',
            '/users': 'http://127.0.0.1:8081',
            '/upload': 'http://127.0.0.1:8081',
            '/updateavatar': 'http://127.0.0.1:8081',
            '/debug': 'http://127.0.0.1:8081',
        },
    };
}
