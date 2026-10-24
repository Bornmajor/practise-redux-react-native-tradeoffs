import type { ConfigContext, ExpoConfig } from 'expo/config';

type Flavor = 'dev' | 'uat' | 'prod';

// Set by scripts/flavor.mjs (or eas.json). Default: dev, so a plain `npx expo start` still works.
const flavor = (process.env.APP_VARIANT ?? 'dev') as Flavor;

const BASE_ID = 'com.bornmajor.basicreactnativeapp';

const FLAVOR_APP = {
  dev: { name: 'Subs (Dev)', id: `${BASE_ID}.dev`, scheme: 'subsdev' },
  uat: { name: 'Subs (UAT)', id: `${BASE_ID}.uat`, scheme: 'subsuat' },
  prod: { name: 'Subs', id: BASE_ID, scheme: 'subs' },
} as const;

if (!(flavor in FLAVOR_APP)) {
  throw new Error(`APP_VARIANT must be dev, uat or prod (got "${process.env.APP_VARIANT}").`);
}

// SAFETY: the env values loaded for this build must belong to the same flavor.
// Stops e.g. a "prod" build that accidentally loaded UAT's URL.
const loadedEnv = process.env.EXPO_PUBLIC_APP_ENV;
if (loadedEnv && loadedEnv !== flavor) {
  throw new Error(
    `Flavor mismatch: building "${flavor}" but the loaded env file is for "${loadedEnv}". ` +
      `Use the npm scripts (e.g. npm run android:${flavor}), which select the right env file.`,
  );
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config, // everything from app.json (icons, splash, plugins…)
  name: FLAVOR_APP[flavor].name,
  slug: config.slug ?? 'basic_react_native_app',
  scheme: FLAVOR_APP[flavor].scheme, // separate deep-link scheme per flavor
  ios: { ...config.ios, bundleIdentifier: FLAVOR_APP[flavor].id },
  android: { ...config.android, package: FLAVOR_APP[flavor].id },
  extra: { ...config.extra, flavor },
});
