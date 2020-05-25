module.exports = {
  apps: [
    {
      name: 'vplan-viso',
      cwd: 'backend/',
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
