// Every EXPO_PUBLIC_ value must be read as process.env.EXPO_PUBLIC_NAME (dot notation),
// so Expo can replace it with the real value when bundling.
const appEnv = process.env.EXPO_PUBLIC_APP_ENV;
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const apiKey = process.env.EXPO_PUBLIC_API_KEY;

// The flavors this app can be built as, and the badge each one shows (empty = no badge)
const FLAVOR_LABELS = { dev: 'DEV', uat: 'UAT', prod: '' } as const;
export type Flavor = keyof typeof FLAVOR_LABELS;

// Fail fast at startup with a clear message, instead of confusing network errors later
if (!appEnv || !(appEnv in FLAVOR_LABELS)) {
  throw new Error(`EXPO_PUBLIC_APP_ENV must be dev, uat or prod (got "${appEnv}").`);
}
if (!apiUrl) throw new Error(`EXPO_PUBLIC_API_URL is not set for the "${appEnv}" flavor.`);
if (!apiKey) throw new Error(`EXPO_PUBLIC_API_KEY is not set for the "${appEnv}" flavor.`);

const flavor = appEnv as Flavor;

// One typed, read-only config object for the whole app
export const env = {
  flavor,
  flavorLabel: FLAVOR_LABELS[flavor],
  apiUrl: apiUrl.replace(/\/+$/, ''), // drop a trailing slash so `${apiUrl}/api` never becomes //api
  apiKey,
} as const;
