import type { StorybookConfig } from '@storybook/react-webpack5';
import { BuildPaths } from '../config/build/types/config';
import path from 'path';
import { DefinePlugin, RuleSetRule } from 'webpack';
import { buildCssLoader } from '../config/build/loaders/buildCssLoader';
const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/preset-scss"
  ],
  "framework": {
    "name": "@storybook/react-webpack5",
    "options": {}
  },
  webpackFinal: async (config, { configType }) => {
    const paths:BuildPaths = {
        build: '',
        html: '',
        entry: '',
        src: path.resolve(__dirname, '..', 'src'),
    };
    config.resolve = {
        ...config.resolve,
    alias: {
        ...(config.resolve?.alias || {}),
        shared: path.resolve(__dirname, '../src/shared'),
        entities: path.resolve(__dirname, '../src/entities'),
        features: path.resolve(__dirname, '../src/features'),
        widgets: path.resolve(__dirname, '../src/widgets'),
        pages: path.resolve(__dirname, '../src/pages'),
        app: path.resolve(__dirname, '../src/app'),
        },
        modules: [
            paths.src,
            ...(config.resolve?.modules || ['node_modules']),
        ],
        extensions: [...(config.resolve?.extensions || []), '.ts', '.tsx'],
    };
    if (config.module?.rules) {
      // @ts-ignore
        config.module.rules = config.module.rules.map((rule: RuleSetRule | '...') => {
            if (rule && typeof rule === 'object' && rule.test && /svg/.test(rule.test.toString())) {
                return { ...rule, exclude: /\.svg$/i };
            }
            return rule;
        });
    }
    config.module?.rules?.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
    });
    config.plugins?.push(new DefinePlugin({
        __IS_DEV__: JSON.stringify(true),
        __API__: JSON.stringify(''),
    }));
    return config;
  },

};
export default config;