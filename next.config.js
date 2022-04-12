const withPlugins = require('next-compose-plugins');
const withAntdLess = require('next-plugin-antd-less');

const nextConfig = {
  reactStrictMode: true,
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
