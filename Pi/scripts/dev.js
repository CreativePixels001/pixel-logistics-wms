#!/usr/bin/env node

/**
 * Pi Assistant - Smart Development Server
 * Handles process orchestration with intelligent port management
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  RESET: '\x1b[0m'
};

function log(message, service = 'DEV', color = COLORS.RESET) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[${timestamp}] [${service}]${COLORS.RESET} ${message}`);
}

class ProcessManager {
  constructor() {
    this.processes = new Map();
    this.shuttingDown = false;
    this.setupSignalHandlers();
  }

  setupSignalHandlers() {
    const cleanup = () => {
      if (this.shuttingDown) return;
      this.shuttingDown = true;
      log('Shutting down all processes...', 'CLEANUP', COLORS.YELLOW);
      this.killAll().then(() => {
        log('All processes terminated', 'CLEANUP', COLORS.GREEN);
        process.exit(0);
      }).catch(() => {
        process.exit(1);
      });
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('uncaughtException', (error) => {
      log(`Uncaught exception: ${error.message}`, 'ERROR', COLORS.RED);
      cleanup();
    });
    process.on('unhandledRejection', (reason) => {
      log(`Unhandled rejection: ${reason}`, 'ERROR', COLORS.RED);
      cleanup();
    });
  }

  async isPortInUse(port) {
    try {
      const { stdout } = await execAsync(`lsof -ti :${port}`);
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  }

  async findAvailablePort(startPort, maxPort = startPort + 10) {
    for (let port = startPort; port <= maxPort; port++) {
      if (!(await this.isPortInUse(port))) {
        return port;
      }
    }
    throw new Error(`No available ports found between ${startPort} and ${maxPort}`);
  }

  async killPortProcess(port) {
    try {
      const { stdout } = await execAsync(`lsof -ti :${port}`);
      const pids = stdout.trim().split('\n').filter(p => p);
      for (const pid of pids) {
        await execAsync(`kill ${pid}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch {
      // Port already free
    }
  }

  spawn(name, command, args, options = {}) {
    const proc = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'pipe',
      env: { ...process.env, ...options.env },
      ...options
    });

    this.processes.set(name, proc);

    proc.stdout.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          log(line, name, this.getServiceColor(name));
        }
      });
    });

    proc.stderr.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          log(line, name, COLORS.RED);
        }
      });
    });

    proc.on('close', (code) => {
      this.processes.delete(name);
      if (!this.shuttingDown) {
        if (code === 0) {
          log(`Process exited normally`, name, COLORS.GREEN);
        } else {
          log(`Process exited with code ${code}`, name, COLORS.RED);
        }
      }
    });

    proc.on('error', (error) => {
      log(`Process error: ${error.message}`, name, COLORS.RED);
      this.processes.delete(name);
    });

    return proc;
  }

  getServiceColor(service) {
    const colors = {
      'SERVER': COLORS.BLUE,
      'FRONTEND': COLORS.GREEN,
      'CLEANUP': COLORS.YELLOW,
      'PM2': COLORS.MAGENTA
    };
    return colors[service] || COLORS.CYAN;
  }

  async killAll() {
    const promises = Array.from(this.processes.entries()).map(([name, proc]) => {
      return new Promise((resolve) => {
        log(`Terminating ${name}...`, 'CLEANUP', COLORS.YELLOW);
        proc.kill('SIGTERM');
        
        const timeout = setTimeout(() => {
          log(`Force killing ${name}`, 'CLEANUP', COLORS.RED);
          proc.kill('SIGKILL');
          resolve();
        }, 5000);
        
        proc.on('close', () => {
          clearTimeout(timeout);
          resolve();
        });
      });
    });

    await Promise.all(promises);
    this.processes.clear();
  }
}

async function runCleanup() {
  log('Running cleanup script...', 'CLEANUP', COLORS.YELLOW);
  try {
    await execAsync('node scripts/cleanup.js', { cwd: projectRoot });
    log('Cleanup completed', 'CLEANUP', COLORS.GREEN);
  } catch (error) {
    log(`Cleanup failed: ${error.message}`, 'CLEANUP', COLORS.RED);
  }
}

async function updateViteConfig(port) {
  try {
    const configPath = path.join(projectRoot, 'vite.config.js');
    const configContent = readFileSync(configPath, 'utf8');
    const newConfig = configContent.replace(/port:\s*\d+/, `port: ${port}`);
    
    const fs = await import('fs');
    fs.writeFileSync(configPath, newConfig);
    log(`Updated Vite config to use port ${port}`, 'FRONTEND', COLORS.GREEN);
  } catch (error) {
    log(`Failed to update Vite config: ${error.message}`, 'FRONTEND', COLORS.RED);
  }
}

async function main() {
  const pm = new ProcessManager();
  
  log('Pi Assistant - Smart Development Server', 'DEV', COLORS.BLUE);
  log('Starting with intelligent process management...', 'DEV', COLORS.BLUE);
  
  try {
    // Run cleanup first
    await runCleanup();
    
    // Wait a bit for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Find available ports
    log('Checking available ports...', 'DEV', COLORS.CYAN);
    
    const serverPort = 3001;
    const frontendPort = await pm.findAvailablePort(5174);
    
    if (await pm.isPortInUse(serverPort)) {
      await pm.killPortProcess(serverPort);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    log(`Server will use port: ${serverPort}`, 'DEV', COLORS.CYAN);
    log(`Frontend will use port: ${frontendPort}`, 'DEV', COLORS.CYAN);
    
    // Update Vite config with available port
    if (frontendPort !== 5174) {
      await updateViteConfig(frontendPort);
    }
    
    // Start backend server
    log('Starting backend server...', 'SERVER', COLORS.BLUE);
    pm.spawn('SERVER', 'node', ['server.js'], {
      env: { PORT: serverPort }
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verify server is running
    try {
      await execAsync(`curl -s http://localhost:${serverPort}/api/health || echo "Server not ready"`);
      log('Backend server is ready', 'SERVER', COLORS.GREEN);
    } catch {
      log('Backend server starting...', 'SERVER', COLORS.YELLOW);
    }
    
    // Start frontend
    log('Starting frontend development server...', 'FRONTEND', COLORS.GREEN);
    pm.spawn('FRONTEND', 'npm', ['run', 'dev'], {
      env: { PORT: frontendPort }
    });
    
    // Wait for frontend to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    log('🎉 Development servers are running!', 'DEV', COLORS.GREEN);
    log(`📱 Frontend: http://localhost:${frontendPort}`, 'DEV', COLORS.GREEN);
    log(`🔧 Backend: http://localhost:${serverPort}`, 'DEV', COLORS.GREEN);
    log('', 'DEV');
    log('Press Ctrl+C to stop all servers', 'DEV', COLORS.YELLOW);
    
    // Keep the process alive
    await new Promise(() => {}); // Infinite promise
    
  } catch (error) {
    log(`Failed to start development servers: ${error.message}`, 'DEV', COLORS.RED);
    await pm.killAll();
    process.exit(1);
  }
}

main().catch(console.error);