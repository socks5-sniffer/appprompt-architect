#!/usr/bin/env node
// Starts the API server and Vite dev server in parallel.
import { spawn } from 'child_process';

const procs = [
  spawn('node', ['server/index.js'], { stdio: 'inherit', env: { ...process.env, FORCE_COLOR: '1' } }),
  spawn('node', ['node_modules/.bin/vite'], { stdio: 'inherit', env: { ...process.env, FORCE_COLOR: '1' } })
];

const shutdown = () => procs.forEach(p => p.kill());
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

procs.forEach(p => p.on('exit', (code) => {
  if (code !== 0 && code !== null) shutdown();
}));
