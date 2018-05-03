const pkg = require('./package.json')

module.exports = {
  apps: [
    {
      name: `vplan-viso-${pkg.version}`,
      script: './index.js',
      watch: false,
      autorestart: true,
      args: [
        '--color',
      ],
      env: {
        NODE_ENV: 'production',
      },
      env_dev: {
        NODE_ENV: 'development',
      },
    },
  ],
}
