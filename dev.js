#!/usr/bin/env node
// Starts the API server and Vite dev server in parallel (cross-platform).
import { spawn } from 'child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const procs = [
  spawn(npm, ['run', 'dev:api'], { stdio: 'inherit' }),
  spawn(npm, ['run', 'dev:web'], { stdio: 'inherit' })
];

const shutdown = () => procs.forEach(p => p.kill());
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

procs.forEach(p => p.on('exit', (code) => {
  if (code !== 0 && code !== null) shutdown();
}));
