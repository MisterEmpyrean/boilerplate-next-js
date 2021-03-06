const webpack = require('webpack')
const { parsed: localEnv } = require('dotenv').config()
const withSourceMaps = require('@zeit/next-source-maps')
const withImages = require('next-images')
const withPlugins = require('next-compose-plugins')
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer')
const { nextI18NextRewrites } = require('next-i18next/rewrites')

const localeSubpaths = {}

const plugins = [
  withSourceMaps,
  withImages,
  [
    withBundleAnalyzer,
    {
      analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
      analyzeBrowser: ['browser', 'both'].includes(process.env.BUNDLE_ANALYZE),
      bundleAnalyzerConfig: {
        server: {
          analyzerMode: 'static',
          reportFilename: '../server-analyze.html',
        },
        browser: {
          analyzerMode: 'static',
          reportFilename: 'client-analyze.html',
        },
      },
    },
  ],
]

module.exports = withPlugins([...plugins], {
  rewrites: async () => nextI18NextRewrites(localeSubpaths),
  publicRuntimeConfig: {
    localeSubpaths,
  },
  webpack: (config) => {
    const conf = config
    const originalEntry = config.entry

    conf.node = {
      fs: 'empty',
    }

    conf.plugins.push(new webpack.EnvironmentPlugin(localEnv))
    conf.entry = async () => {
      const entries = await originalEntry()
      if (
        entries['main.js'] &&
        !entries['main.js'].includes('./polyfills/index.js')
      ) {
        entries['main.js'].unshift('./polyfills/index.js')
      }

      return entries
    }

    return conf
  },
})
