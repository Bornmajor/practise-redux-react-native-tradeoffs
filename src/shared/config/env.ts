// Every EXPO_PUBLIC_ value must be read as process.env.EXPO_PUBLIC_NAME (dot notation),
// so Expo can replace it with the real value when bundling.
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const apiKey = process.env.EXPO_PUBLIC_API_KEY;
const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';

// The environments the app understands
type AppEnv = 'development' | 'preview' | 'production';

// Fail fast at startup with a clear message, instead of confusing network errors later
if (!apiUrl) {
  throw new Error('EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and fill it in.');
}
if (!apiKey) {
  throw new Error('EXPO_PUBLIC_API_KEY is not set. Copy .env.example to .env and fill it in.');
}
if (!['development', 'preview', 'production'].includes(appEnv)) {
  throw new Error(`EXPO_PUBLIC_APP_ENV must be development, preview or production (got "${appEnv}").`);
}

// One typed, read-only config object for the whole app
export const env = {
  apiUrl: apiUrl.replace(/\/+$/, ''), // drop a trailing slash so `${apiUrl}/api` never becomes //api
  apiKey,
  appEnv: appEnv as AppEnv,
} as const;
