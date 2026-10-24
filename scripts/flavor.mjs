// Usage: node scripts/flavor.mjs <dev|uat|prod> <expo command and options…>
// 1. copies env/.env.<flavor> to .env.local (the values Expo will load)
// 2. runs `npx expo <command…>` with APP_VARIANT=<flavor> (read by app.config.ts)
import { copyFileSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

const FLAVORS = ['dev', 'uat', 'prod'];
const [flavor, ...expoArgs] = process.argv.slice(2);

if (!FLAVORS.includes(flavor) || expoArgs.length === 0) {
  console.error('Usage: node scripts/flavor.mjs <dev|uat|prod> <expo command…>');
  process.exit(1);
}

const envFile = `env/.env.${flavor}`;
if (!existsSync(envFile)) {
  console.error(`Missing ${envFile}. Copy ${envFile}.example to ${envFile} and fill it in.`);
  process.exit(1);
}

copyFileSync(envFile, '.env.local');
console.log(`▶ Flavor "${flavor}": using ${envFile}`);

const child = spawn('npx', ['expo', ...expoArgs], {
  stdio: 'inherit',
  shell: true, // needed on Windows to find npx
  env: { ...process.env, APP_VARIANT: flavor },
});
child.on('exit', (code) => process.exit(code ?? 1));
