#!/usr/bin/env node
// Starts the API server and Vite dev server in parallel (cross-platform).
import { spawn } from 'child_process';

const opts = { stdio: 'inherit', shell: true };

const procs = [
  spawn('npm', ['run', 'dev:api'], opts),
  spawn('npm', ['run', 'dev:web'], opts)
];

const shutdown = () => procs.forEach(p => p.kill());
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

procs.forEach(p => p.on('exit', (code) => {
  if (code !== 0 && code !== null) shutdown();
}));
