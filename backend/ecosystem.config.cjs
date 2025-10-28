module.exports = {
  apps: [{
    name: "titleiq-backend",
    script: "index.js",
    cwd: "/var/www/titleiq/backend",
    instances: 1,
    exec_mode: "fork",
    watch: false,
    max_memory_restart: "500M",
    env_production: {
      NODE_ENV: "production",
      PORT: 5000
    },
    env_development: {
      NODE_ENV: "development",
      PORT: 5000
    },
    error_file: "/root/.pm2/logs/titleiq-backend-error.log",
    out_file: "/root/.pm2/logs/titleiq-backend-out.log",
    log_date_format: "YYYY-MM-DDTHH:mm:ss",
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: "10s"
  }]
};
