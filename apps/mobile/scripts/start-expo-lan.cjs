const os = require('os');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function getLanIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses || []) {
      if (address.family === 'IPv4' && !address.internal) {
        candidates.push(address.address);
      }
    }
  }

  if (candidates.length === 0) return null;

  // Prefer RFC 1918 private ranges; fall back to any non-loopback IPv4.
  const rfc1918 = candidates.find((ip) =>
    /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(ip),
  );
  return rfc1918 ?? candidates[0];
}

const host = process.env.REACT_NATIVE_PACKAGER_HOSTNAME || getLanIp();

if (!host) {
  console.error('Could not determine a LAN IPv4 address for Expo.');
  console.error('Set REACT_NATIVE_PACKAGER_HOSTNAME to your PC IP (e.g. 192.168.1.5).');
  process.exit(1);
}

// ── Auto-write EXPO_PUBLIC_API_URL to apps/mobile/.env ──────────────────────
const envPath = path.join(__dirname, '..', '.env');
const apiUrl = `http://${host}:3005`;
const envLine = `EXPO_PUBLIC_API_URL=${apiUrl}`;

let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  if (/^EXPO_PUBLIC_API_URL=.*/m.test(envContent)) {
    envContent = envContent.replace(/^EXPO_PUBLIC_API_URL=.*/m, envLine);
  } else {
    envContent = envContent.trimEnd() + '\n' + envLine + '\n';
  }
} else {
  envContent = envLine + '\n';
}
fs.writeFileSync(envPath, envContent, 'utf8');
// ────────────────────────────────────────────────────────────────────────────

const rawArgs = process.argv.slice(2);
const wantsClear =
  rawArgs.includes('--clear') || process.env.EXPO_CLEAR_CACHE === '1';
const passthrough = rawArgs.filter((a) => a !== '--clear');

// NOTE: --go is intentionally omitted. In Expo SDK 54 the --go flag changes the
// manifest URL to an http:// format that Android opens in Chrome instead of
// Expo Go. Plain `expo start --host lan` generates the exp:// deep-link format
// that Expo Go handles correctly.
let expoCommand = 'npx expo start --host lan';
if (wantsClear) expoCommand += ' --clear';
if (passthrough.length) expoCommand += ' ' + passthrough.join(' ');
expoCommand = expoCommand.trim();

console.log('\n\x1b[32m━━━━━━━━ Dayla · Expo Go (LAN) ━━━━━━━━\x1b[0m');
console.log(`Packager host : \x1b[1m${host}\x1b[0m`);
console.log(`Backend URL   : \x1b[1m${apiUrl}\x1b[0m  → written to apps/mobile/.env`);
console.log(`Expo Go URL   : exp://${host}:8081`);
console.log('');
console.log('\x1b[1mRequirements for LAN mode:\x1b[0m');
console.log('  • Phone and PC must be on the SAME WiFi network.');
console.log('  • Windows Firewall must allow inbound TCP on port 8081.');
console.log('    Run this once in an admin PowerShell to open the port:');
console.log('    \x1b[36mnetsh advfirewall firewall add rule name="Expo Metro" dir=in action=allow protocol=TCP localport=8081\x1b[0m');
console.log('');
console.log('\x1b[1mHow to scan:\x1b[0m');
console.log('  Open Expo Go → tap the QR icon / "Scan QR code".');
console.log('  Do NOT use the phone\'s native camera — it opens http:// in Chrome.');
console.log('');
console.log('\x1b[33mIf port 8081 is still unreachable (e.g. institutional WiFi that blocks');
console.log('peer-to-peer traffic), use tunnel mode instead:\x1b[0m');
console.log('  \x1b[36mnpm run start:tunnel\x1b[0m');
console.log('\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');

console.log(`Starting: ${expoCommand}\n`);

const child = spawn(expoCommand, {
  cwd: path.join(__dirname, '..'),
  shell: true,
  stdio: 'inherit',
  env: {
    ...process.env,
    REACT_NATIVE_PACKAGER_HOSTNAME: host,
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
