// Usage: node scripts/flavor.mjs <dev|uat|prod> <expo command and options…>
// 1. copies env/.env.<flavor> to .env.local (the values Expo will load)
// 2. for native builds (run:android / run:ios): regenerates the native folder when it was
//    generated for a different flavor (expo run:* never updates an existing folder)
// 3. runs `npx expo <command…>` with APP_VARIANT=<flavor> (read by app.config.ts)
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

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

const env = { ...process.env, APP_VARIANT: flavor };

// Runs `npx expo …args` and stops this script if it fails
function expo(args) {
  const result = spawnSync('npx', ['expo', ...args], { stdio: 'inherit', shell: true, env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// Native builds: make sure android/ (or ios/) was generated for THIS flavor
const command = expoArgs[0];
if (command === 'run:android' || command === 'run:ios') {
  const platform = command === 'run:android' ? 'android' : 'ios';
  const marker = `${platform}/.flavor`; // which flavor this native folder was generated for
  const builtFor = existsSync(marker) ? readFileSync(marker, 'utf8').trim() : null;

  if (builtFor !== flavor) {
    console.log(
      `▶ ${platform}/ was generated for "${builtFor ?? 'unknown'}": regenerating for "${flavor}"`,
    );
    expo(['prebuild', '--clean', '--platform', platform, '--no-install']);
    writeFileSync(marker, flavor);
  }
}

expo(expoArgs);
