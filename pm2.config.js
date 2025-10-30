const path = require('path');

module.exports = {
  apps: [
    {
      name: 'nofx-backend',
      script: './nofx',
      cwd: __dirname, // 使用当前目录（配置文件所在目录）
      interpreter: 'none', // 不使用解释器，直接执行二进制文件
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    {
      name: 'nofx-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: path.join(__dirname, 'web'), // 动态拼接 web 目录
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
