#!/usr/bin/env node

/**
 * Pi Assistant - Process Cleanup Script
 * Kills all related processes and cleans up ports
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
  RESET: '\x1b[0m'
};

function log(message, color = COLORS.RESET) {
  console.log(`${color}[CLEANUP]${COLORS.RESET} ${message}`);
}

async function killProcessesByName(name) {
  try {
    const { stdout } = await execAsync(`pgrep -f "${name}"`);
    const pids = stdout.trim().split('\n').filter(pid => pid);
    
    if (pids.length > 0) {
      log(`Found ${pids.length} ${name} processes: ${pids.join(', ')}`, COLORS.YELLOW);
      await execAsync(`pkill -f "${name}"`);
      log(`Killed ${name} processes`, COLORS.GREEN);
      
      // Wait for processes to die
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Force kill if still running
      try {
        const { stdout: remaining } = await execAsync(`pgrep -f "${name}"`);
        if (remaining.trim()) {
          log(`Force killing remaining ${name} processes`, COLORS.RED);
          await execAsync(`pkill -9 -f "${name}"`);
        }
      } catch (e) {
        // No processes found - good
      }
    }
  } catch (error) {
    // No processes found
    log(`No ${name} processes found`, COLORS.CYAN);
  }
}

async function killProcessesByPort(port) {
  try {
    const { stdout } = await execAsync(`lsof -ti :${port}`);
    const pids = stdout.trim().split('\n').filter(pid => pid);
    
    if (pids.length > 0) {
      log(`Found processes on port ${port}: ${pids.join(', ')}`, COLORS.YELLOW);
      for (const pid of pids) {
        await execAsync(`kill ${pid}`);
      }
      log(`Freed port ${port}`, COLORS.GREEN);
      
      // Wait and force kill if needed
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const { stdout: remaining } = await execAsync(`lsof -ti :${port}`);
        if (remaining.trim()) {
          log(`Force killing processes on port ${port}`, COLORS.RED);
          await execAsync(`kill -9 ${remaining.trim()}`);
        }
      } catch (e) {
        // Port is free
      }
    }
  } catch (error) {
    log(`Port ${port} is already free`, COLORS.CYAN);
  }
}

async function main() {
  log('Starting Pi Assistant cleanup...', COLORS.BLUE);
  
  try {
    // Kill by process names
    await killProcessesByName('node server.js');
    await killProcessesByName('vite');
    await killProcessesByName('pi-assistant');
    
    // Kill by ports
    const ports = [3001, 5174, 5175, 5176, 5177];
    for (const port of ports) {
      await killProcessesByPort(port);
    }
    
    // Clean up any Node.js processes in the Pi directory
    try {
      const cwd = process.cwd();
      if (cwd.includes('/Pi')) {
        await killProcessesByName('node');
      }
    } catch (error) {
      // Ignore
    }
    
    log('Cleanup completed successfully!', COLORS.GREEN);
    process.exit(0);
    
  } catch (error) {
    log(`Cleanup failed: ${error.message}`, COLORS.RED);
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  log('Cleanup interrupted', COLORS.YELLOW);
  process.exit(1);
});

process.on('SIGTERM', () => {
  log('Cleanup terminated', COLORS.YELLOW);
  process.exit(1);
});

main();