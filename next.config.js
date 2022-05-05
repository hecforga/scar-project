const withPlugins = require('next-compose-plugins');
const withAntdLess = require('next-plugin-antd-less');

const nextConfig = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 600,
};

const pluginAntdLess = withAntdLess({
  lessVarsFilePath: './styles/antd-custom.less',
});

module.exports = withPlugins([[pluginAntdLess]], {
  ...nextConfig,

  webpack(config) {
    return config;
  },
});
