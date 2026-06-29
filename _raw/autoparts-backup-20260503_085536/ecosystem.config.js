module.exports = {
  apps: [{
    name: 'autoparts',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/autoparts',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    restart_delay: 3000,
    max_restarts: 10,
  }]
};
