#!/usr/bin/env node

/**
 * Development script with memory leak prevention
 * 
 * This script starts the development server with proper memory leak handling
 * to prevent the "MaxListenersExceededWarning" in development environments.
 */

const { spawn } = require('child_process');
const path = require('path');

// Set max listeners to prevent memory leak warnings
process.setMaxListeners(20);

// Set environment variables
process.env.NODE_OPTIONS = '--max-old-space-size=4096';
process.env.NODE_ENV = 'development';

// Start Vite with proper memory handling
const viteProcess = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..'),
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=4096 --max-listeners=20'
  }
});

// Handle process cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  viteProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  viteProcess.kill('SIGTERM');
  process.exit(0);
});

viteProcess.on('error', (error) => {
  console.error('❌ Error starting development server:', error);
  process.exit(1);
});

viteProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Development server exited with code ${code}`);
    process.exit(code);
  }
});
