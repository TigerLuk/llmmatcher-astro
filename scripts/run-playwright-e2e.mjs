import { spawn, spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32'
  ? ['cmd.exe', ['/c', 'npm run preview -- --host 127.0.0.1 --port 4321']]
  : ['npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4321']];
const playwrightCommand = process.platform === 'win32'
  ? ['cmd.exe', ['/c', 'npx playwright test']]
  : ['npx', ['playwright', 'test']];
const baseUrl = 'http://127.0.0.1:4321/';
const timeoutMs = 60000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeout) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Keep polling until timeout.
    }
    await sleep(1000);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function stopServer(server) {
  if (!server.pid) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    server.kill('SIGTERM');
  }
}

const previewServer = spawn(npmCommand[0], npmCommand[1], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: process.env,
});

let shuttingDown = false;
const shutdown = () => {
  if (shuttingDown) return;
  shuttingDown = true;
  stopServer(previewServer);
};

process.on('SIGINT', () => {
  shutdown();
  process.exit(130);
});
process.on('SIGTERM', () => {
  shutdown();
  process.exit(143);
});

try {
  await waitForServer(baseUrl, timeoutMs);
  const testExitCode = await new Promise((resolve, reject) => {
    const child = spawn(playwrightCommand[0], playwrightCommand[1], {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: { ...process.env, PLAYWRIGHT_EXTERNAL_SERVER: '1' },
    });
    child.on('exit', (code) => resolve(code ?? 1));
    child.on('error', reject);
  });
  shutdown();
  process.exit(Number(testExitCode));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  shutdown();
  process.exit(1);
}
